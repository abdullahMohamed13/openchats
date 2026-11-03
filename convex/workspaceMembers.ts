import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	query,
} from "./_generated/server";
import {
	getAuthUserId,
	requireAdminForAction,
	requireFullAccount,
	requireMembership,
	requireMembershipForAction,
} from "./access";
import { removeUserFromWorkspaceChannels } from "./channels";
import { getStreamServerAuth } from "./stream";

type MemberProfile = {
	userId: string;
	name: string;
	username: string | null;
	email: string | null;
	image: string | null;
	role: "owner" | "admin" | "member";
	joinedAt: number;
};

export const listMemberProfilesInternal = internalQuery({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }): Promise<MemberProfile[]> => {
		const memberships = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();

		return await Promise.all(
			memberships.map(async (membership) => {
				const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
					model: "user",
					where: [
						{ field: "_id", operator: "eq", value: membership.userId },
					],
					select: ["id", "name", "username", "email", "image"],
				});
				const doc = user as {
					name?: string | null;
					username?: string | null;
					email?: string | null;
					image?: string | null;
				} | null;

				return {
					userId: membership.userId,
					name:
						doc?.name?.trim() ||
						doc?.username ||
						doc?.email ||
						membership.userId,
					username: doc?.username ?? null,
					email: doc?.email ?? null,
					image: doc?.image ?? null,
					role: membership.role,
					joinedAt: membership.joinedAt,
				};
			}),
		);
	},
});

export const listMembers = query({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }): Promise<MemberProfile[]> => {
		const userId = await getAuthUserId(ctx);
		await requireMembership(ctx, workspaceId, userId);
		return await ctx.runQuery(internal.workspaceMembers.listMemberProfilesInternal, {
			workspaceId,
		});
	},
});

export const addMemberInternal = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		userId: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, { workspaceId, userId, role }) => {
		const existing = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();
		if (existing) return { added: false as const, role: existing.role };

		await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId,
			role,
			joinedAt: Date.now(),
		});
		return { added: true as const, role };
	},
});

export const removeMemberInternal = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		userId: v.string(),
	},
	handler: async (ctx, { workspaceId, userId }) => {
		const membership = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();
		if (membership) await ctx.db.delete(membership._id);
	},
});

export const setMemberRoleInternal = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		userId: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (ctx, { workspaceId, userId, role }) => {
		const membership = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", userId),
			)
			.first();
		if (!membership) throw new Error("That person is not a member of this workspace");
		await ctx.db.patch(membership._id, { role });
	},
});

export const transferOwnershipData = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		currentOwnerId: v.string(),
		newOwnerId: v.string(),
	},
	handler: async (ctx, { workspaceId, currentOwnerId, newOwnerId }) => {
		const workspace = await ctx.db.get(workspaceId);
		if (!workspace) throw new Error("Workspace not found");
		if (workspace.ownerId !== currentOwnerId) {
			throw new Error("Ownership changed. Refresh and try again.");
		}

		const newOwner = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", newOwnerId),
			)
			.first();
		if (!newOwner) {
			throw new Error("That person is not a member of this workspace");
		}

		const oldOwner = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", workspaceId).eq("userId", currentOwnerId),
			)
			.first();

		await ctx.db.patch(workspaceId, { ownerId: newOwnerId });
		await ctx.db.patch(newOwner._id, { role: "owner" });
		if (oldOwner) await ctx.db.patch(oldOwner._id, { role: "admin" });
	},
});

export const leaveWorkspace = action({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }): Promise<{ ok: true }> => {
		const userId = await getAuthUserId(ctx);
		await requireFullAccount(ctx);
		const membership = await requireMembershipForAction(
			ctx,
			workspaceId,
			userId,
		);
		if (membership.role === "owner") {
			throw new Error(
				"The owner can't leave. Delete the workspace or hand it over first.",
			);
		}

		await ctx.runMutation(internal.workspaceMembers.removeMemberInternal, {
			workspaceId,
			userId,
		});

		const auth = await getStreamServerAuth();
		await removeUserFromWorkspaceChannels(ctx, auth, workspaceId, userId);

		return { ok: true };
	},
});

export const setMemberRole = action({
	args: {
		workspaceId: v.id("workspaces"),
		userId: v.string(),
		role: v.union(v.literal("admin"), v.literal("member")),
	},
	handler: async (
		ctx,
		{ workspaceId, userId: targetUserId, role },
	): Promise<{ ok: true }> => {
		const actorId = await getAuthUserId(ctx);
		await requireFullAccount(ctx);
		const actor = await requireMembershipForAction(
			ctx,
			workspaceId,
			actorId,
		);

		if (actor.role !== "owner") {
			throw new Error("Only the workspace owner can change roles");
		}
		if (targetUserId === actorId) {
			throw new Error("You can't change your own role");
		}

		const target = await ctx.runQuery(
			internal.access.getMembershipInternal,
			{ workspaceId, userId: targetUserId },
		);
		if (!target) {
			throw new Error("That person is not a member of this workspace");
		}
		if (target.role === "owner") {
			throw new Error("The workspace owner's role can't be changed");
		}

		await ctx.runMutation(internal.workspaceMembers.setMemberRoleInternal, {
			workspaceId,
			userId: targetUserId,
			role,
		});

		return { ok: true };
	},
});

export const transferOwnership = action({
	args: {
		workspaceId: v.id("workspaces"),
		userId: v.string(),
	},
	handler: async (
		ctx,
		{ workspaceId, userId: newOwnerId },
	): Promise<{ ok: true }> => {
		const actorId = await getAuthUserId(ctx);
		await requireFullAccount(ctx);
		const actor = await requireMembershipForAction(
			ctx,
			workspaceId,
			actorId,
		);

		if (actor.role !== "owner") {
			throw new Error("Only the workspace owner can transfer ownership");
		}
		if (newOwnerId === actorId) {
			throw new Error("You already own this workspace");
		}

		const target = await ctx.runQuery(
			internal.access.getMembershipInternal,
			{ workspaceId, userId: newOwnerId },
		);
		if (!target) {
			throw new Error("That person is not a member of this workspace");
		}

		await ctx.runMutation(internal.workspaceMembers.transferOwnershipData, {
			workspaceId,
			currentOwnerId: actorId,
			newOwnerId,
		});

		return { ok: true };
	},
});

export const removeMember = action({
	args: {
		workspaceId: v.id("workspaces"),
		userId: v.string(),
	},
	handler: async (ctx, { workspaceId, userId: targetUserId }): Promise<{ ok: true }> => {
		await requireFullAccount(ctx);
		const actorId = await getAuthUserId(ctx);
		const actor = await requireAdminForAction(ctx, workspaceId, actorId);

		if (targetUserId === actorId) {
			throw new Error("Use “Leave workspace” to remove yourself");
		}

		const target = await ctx.runQuery(internal.access.getMembershipInternal, {
			workspaceId,
			userId: targetUserId,
		});
		if (!target) {
			throw new Error("That person is not a member of this workspace");
		}
		if (target.role === "owner") {
			throw new Error("The workspace owner can't be removed");
		}
		if (actor.role === "admin" && target.role === "admin") {
			throw new Error("Admins can't remove other admins");
		}

		await ctx.runMutation(internal.workspaceMembers.removeMemberInternal, {
			workspaceId,
			userId: targetUserId,
		});

		const auth = await getStreamServerAuth();
		await removeUserFromWorkspaceChannels(
			ctx,
			auth,
			workspaceId,
			targetUserId,
		);

		return { ok: true };
	},
});
