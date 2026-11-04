import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import {
	getAuthUserId,
	requireAdmin,
	requireAdminForAction,
	requireFullAccount,
} from "./access";
import { authComponent } from "./auth";
import { addUserToWorkspaceChannels } from "./channels";
import { getStreamServerAuth, upsertStreamUser } from "./stream";

type UserProfile = {
	name?: string | null;
	username?: string | null;
	email?: string | null;
	image?: string | null;
};

export const getJoinRequestInternal = internalQuery({
	args: { requestId: v.id("workspaceJoinRequests") },
	handler: async (ctx, { requestId }) => ctx.db.get(requestId),
});

export const resolveJoinRequestInternal = internalMutation({
	args: {
		requestId: v.id("workspaceJoinRequests"),
		status: v.union(v.literal("accepted"), v.literal("declined")),
		resolvedBy: v.string(),
	},
	handler: async (ctx, { requestId, status, resolvedBy }) => {
		await ctx.db.patch(requestId, {
			status,
			resolvedAt: Date.now(),
			resolvedBy,
		});
	},
});

export const requestToJoinWorkspace = mutation({
	args: { workspaceId: v.string() },
	handler: async (ctx, { workspaceId: rawWorkspaceId }): Promise<{ status: "pending" }> => {
		const user = await requireFullAccount(ctx);
		const userId = String(user._id);

		const workspaceId = await ctx.db.normalizeId(
			"workspaces",
			rawWorkspaceId.trim(),
		);
		if (!workspaceId) {
			throw new Error("No workspace was found with that ID");
		}

		const workspace = await ctx.db.get(workspaceId);
		if (!workspace) {
			throw new Error("No workspace was found with that ID");
		}
		if (workspace.kind) {
			throw new Error("Guest workspaces can't be joined by ID");
		}

		const membership = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();
		if (membership) {
			throw new Error("You're already a member of this workspace");
		}

		const existing = await ctx.db
			.query("workspaceJoinRequests")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();

		if (existing?.status === "pending") {
			return { status: "pending" };
		}

		if (existing) {
			await ctx.db.patch(existing._id, {
				status: "pending",
				createdAt: Date.now(),
				resolvedAt: undefined,
				resolvedBy: undefined,
			});
			return { status: "pending" };
		}

		await ctx.db.insert("workspaceJoinRequests", {
			workspaceId,
			userId,
			status: "pending",
			createdAt: Date.now(),
		});

		return { status: "pending" };
	},
});

export const listMyJoinRequests = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) return [];

		const requests = await ctx.db
			.query("workspaceJoinRequests")
			.withIndex("userId", (q) => q.eq("userId", String(user._id)))
			.collect();

		const rows = await Promise.all(
			requests
				.filter((request) => request.status === "pending")
				.map(async (request) => {
					const workspace = await ctx.db.get(request.workspaceId);
					if (!workspace) return null;

					return {
						_id: request._id,
						workspaceId: request.workspaceId,
						workspaceName: workspace.name,
						createdAt: request.createdAt,
					};
				}),
		);

		return rows
			.filter((row): row is NonNullable<typeof row> => row !== null)
			.sort((a, b) => b.createdAt - a.createdAt);
	},
});

export const listWorkspaceJoinRequests = query({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);

		const requests = await ctx.db
			.query("workspaceJoinRequests")
			.withIndex("workspaceId_status", (q) =>
				q.eq("workspaceId", workspaceId).eq("status", "pending"),
			)
			.collect();

		return await Promise.all(
			requests.map(async (request) => {
				const user = await ctx.runQuery(
					components.betterAuth.adapter.findOne,
					{
						model: "user",
						where: [
							{ field: "_id", operator: "eq", value: request.userId },
						],
						select: ["id", "name", "username", "email", "image"],
					},
				);
				const profile = user as UserProfile | null;

				return {
					_id: request._id,
					userId: request.userId,
					name:
						profile?.name?.trim() ||
						profile?.username ||
						profile?.email ||
						request.userId,
					username: profile?.username ?? null,
					email: profile?.email ?? null,
					image: profile?.image ?? null,
					createdAt: request.createdAt,
				};
			}),
		);
	},
});

export const acceptJoinRequest = action({
	args: { requestId: v.id("workspaceJoinRequests") },
	handler: async (ctx, { requestId }): Promise<{ workspaceId: string }> => {
		const actorId = await getAuthUserId(ctx);
		await requireFullAccount(ctx);

		const request = await ctx.runQuery(
			internal.joinRequests.getJoinRequestInternal,
			{ requestId },
		);
		if (!request) throw new Error("Join request not found");
		if (request.status !== "pending") {
			throw new Error("This join request was already handled");
		}

		await requireAdminForAction(ctx, request.workspaceId, actorId);

		const membership = await ctx.runQuery(
			internal.access.getMembershipInternal,
			{ workspaceId: request.workspaceId, userId: request.userId },
		);
		if (!membership) {
			await ctx.runMutation(
				internal.workspaceMembers.addMemberInternal,
				{
					workspaceId: request.workspaceId,
					userId: request.userId,
					role: "member",
				},
			);
		}

		const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "_id", operator: "eq", value: request.userId }],
			select: ["id", "name", "username", "email", "image"],
		});
		const profile = user as UserProfile | null;

		const auth = await getStreamServerAuth();
		await upsertStreamUser(auth, {
			id: request.userId,
			name:
				profile?.name?.trim() ||
				profile?.username ||
				profile?.email ||
				request.userId,
			image: profile?.image ?? undefined,
		});
		await addUserToWorkspaceChannels(
			ctx,
			auth,
			request.workspaceId,
			request.userId,
		);

		await ctx.runMutation(
			internal.joinRequests.resolveJoinRequestInternal,
			{ requestId, status: "accepted", resolvedBy: actorId },
		);

		return { workspaceId: String(request.workspaceId) };
	},
});

export const declineJoinRequest = mutation({
	args: { requestId: v.id("workspaceJoinRequests") },
	handler: async (ctx, { requestId }): Promise<{ ok: true }> => {
		const actorId = await getAuthUserId(ctx);
		const request = await ctx.db.get(requestId);
		if (!request) throw new Error("Join request not found");
		if (request.status !== "pending") {
			throw new Error("This join request was already handled");
		}

		await requireAdmin(ctx, request.workspaceId, actorId);

		await ctx.db.patch(requestId, {
			status: "declined",
			resolvedAt: Date.now(),
			resolvedBy: actorId,
		});

		return { ok: true };
	},
});
