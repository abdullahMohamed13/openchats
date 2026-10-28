import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
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
	requireMembership,
	requireMembershipForAction,
} from "./access";
import { authComponent } from "./auth";
import {
	deleteWorkspaceChannels,
	removeUserFromWorkspaceChannels,
} from "./channels";
import {
	createWorkspaceChannel,
	getStreamServerAuth,
	upsertStreamUser,
} from "./stream";

type WorkspaceSummary = {
	_id: Id<"workspaces">;
	name: string;
	slug: string;
	imageUrl: string | null;
	role: "owner" | "admin" | "member";
	joinedAt: number;
	createdAt: number;
};

const MAX_WORKSPACE_IMAGE_BYTES = 5 * 1024 * 1024;

type MemberProfile = {
	userId: string;
	name: string;
	username: string | null;
	email: string | null;
	image: string | null;
	role: "owner" | "admin" | "member";
	joinedAt: number;
};

function slugifyWorkspaceName(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);
}

function normalizeWorkspaceName(value: string): string {
	const trimmed = value.trim().replace(/\s+/g, " ");
	if (trimmed.length < 2 || trimmed.length > 50) {
		throw new Error("Workspace name must be between 2 and 50 characters");
	}
	return trimmed;
}

export const listMyWorkspaces = query({
	args: {},
	handler: async (ctx): Promise<WorkspaceSummary[]> => {
		const user = await authComponent.getAuthUser(ctx);
		const userId = String(user._id);

		const memberships = await ctx.db
			.query("workspaceMembers")
			.withIndex("userId", (q) => q.eq("userId", userId))
			.collect();

		const rows: (WorkspaceSummary | null)[] = await Promise.all(
			memberships.map(async (membership) => {
				const workspace = await ctx.db.get(membership.workspaceId);
				if (!workspace) return null;

				return {
					_id: workspace._id,
					name: workspace.name,
					slug: workspace.slug,
					imageUrl: workspace.imageId
						? await ctx.storage.getUrl(workspace.imageId)
						: null,
					role: membership.role,
					joinedAt: membership.joinedAt,
					createdAt: workspace.createdAt,
				};
			}),
		);

		return rows
			.filter((row): row is WorkspaceSummary => row !== null)
			.sort((a, b) => a.joinedAt - b.joinedAt);
	},
});

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
		return await ctx.runQuery(internal.workspaces.listMemberProfilesInternal, {
			workspaceId,
		});
	},
});

export const insertWorkspace = internalMutation({
	args: {
		name: v.string(),
		ownerId: v.string(),
	},
	handler: async (ctx, { name, ownerId }) => {
		const baseSlug = slugifyWorkspaceName(name) || "workspace";
		let slug = baseSlug;
		let suffix = 2;

		while (
			await ctx.db
				.query("workspaces")
				.withIndex("slug", (q) => q.eq("slug", slug))
				.first()
		) {
			slug = `${baseSlug}-${suffix}`;
			suffix += 1;
		}

		const now = Date.now();
		const workspaceId = await ctx.db.insert("workspaces", {
			name,
			slug,
			ownerId,
			createdAt: now,
		});
		await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId: ownerId,
			role: "owner",
			joinedAt: now,
		});
		await ctx.db.insert("channels", {
			workspaceId,
			streamId: `${workspaceId}-general`,
			name: "general",
			createdBy: ownerId,
			createdAt: now,
		});

		return { workspaceId, slug };
	},
});

export const deleteWorkspaceData = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }) => {
		const invites = await ctx.db
			.query("workspaceInvites")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();
		const channels = await ctx.db
			.query("channels")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();
		const members = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();

		for (const invite of invites) {
			await ctx.db.delete(invite._id);
		}
		for (const channel of channels) {
			await ctx.db.delete(channel._id);
		}
		for (const member of members) {
			await ctx.db.delete(member._id);
		}

		const workspace = await ctx.db.get(workspaceId);
		if (workspace?.imageId) {
			await ctx.storage.delete(workspace.imageId);
		}

		await ctx.db.delete(workspaceId);
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

export const renameWorkspaceData = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
	},
	handler: async (ctx, { workspaceId, name }) => {
		await ctx.db.patch(workspaceId, { name });
	},
});

export const createWorkspace = action({
	args: {
		name: v.string(),
	},
	handler: async (ctx, { name }): Promise<{ workspaceId: Id<"workspaces"> }> => {
		const user = await authComponent.getAuthUser(ctx);
		const trimmedName = normalizeWorkspaceName(name);

		const userId = String(user._id);
		const { workspaceId } = await ctx.runMutation(
			internal.workspaces.insertWorkspace,
			{ name: trimmedName, ownerId: userId },
		);

		try {
			const auth = await getStreamServerAuth();
			const displayName =
				user.name?.trim() || user.username || user.email || userId;

			await upsertStreamUser(auth, {
				id: userId,
				name: displayName,
				image: user.image ?? undefined,
			});
			await createWorkspaceChannel(auth, {
				workspaceId: String(workspaceId),
				userId,
				name: "general",
				memberIds: [userId],
			});
		} catch (error) {
			await ctx.runMutation(internal.workspaces.deleteWorkspaceData, {
				workspaceId,
			});
			throw error;
		}

		return { workspaceId };
	},
});

export const renameWorkspace = action({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
	},
	handler: async (ctx, { workspaceId, name }): Promise<{ name: string }> => {
		const userId = await getAuthUserId(ctx);
		await requireAdminForAction(ctx, workspaceId, userId);
		const trimmedName = normalizeWorkspaceName(name);

		await ctx.runMutation(internal.workspaces.renameWorkspaceData, {
			workspaceId,
			name: trimmedName,
		});

		return { name: trimmedName };
	},
});

export const generateWorkspaceImageUploadUrl = mutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }): Promise<string> => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);
		return await ctx.storage.generateUploadUrl();
	},
});

export const setWorkspaceImage = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		storageId: v.id("_storage"),
	},
	handler: async (
		ctx,
		{ workspaceId, storageId },
	): Promise<{ imageUrl: string | null }> => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);

		const workspace = await ctx.db.get(workspaceId);
		if (!workspace) {
			throw new Error("Workspace not found");
		}

		const metadata = await ctx.db.system.get("_storage", storageId);
		if (!metadata) {
			throw new Error("The uploaded image could not be found");
		}
		if (!metadata.contentType?.startsWith("image/")) {
			await ctx.storage.delete(storageId);
			throw new Error("Workspace images must be image files");
		}
		if (metadata.size > MAX_WORKSPACE_IMAGE_BYTES) {
			await ctx.storage.delete(storageId);
			throw new Error("Workspace images must be 5 MB or smaller");
		}

		await ctx.db.patch(workspaceId, { imageId: storageId });
		if (workspace.imageId && workspace.imageId !== storageId) {
			await ctx.storage.delete(workspace.imageId);
		}

		return { imageUrl: await ctx.storage.getUrl(storageId) };
	},
});

export const removeWorkspaceImage = mutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }): Promise<{ ok: true }> => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);

		const workspace = await ctx.db.get(workspaceId);
		if (!workspace) {
			throw new Error("Workspace not found");
		}

		await ctx.db.patch(workspaceId, { imageId: undefined });
		if (workspace.imageId) {
			await ctx.storage.delete(workspace.imageId);
		}

		return { ok: true };
	},
});

export const deleteWorkspace = action({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }): Promise<{ ok: true }> => {
		const userId = await getAuthUserId(ctx);
		const membership = await requireMembershipForAction(
			ctx,
			workspaceId,
			userId,
		);
		if (membership.role !== "owner") {
			throw new Error("Only the workspace owner can delete it");
		}

		const auth = await getStreamServerAuth();
		await deleteWorkspaceChannels(ctx, auth, workspaceId);
		await ctx.runMutation(internal.workspaces.deleteWorkspaceData, {
			workspaceId,
		});

		return { ok: true };
	},
});

export const leaveWorkspace = action({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, { workspaceId }): Promise<{ ok: true }> => {
		const userId = await getAuthUserId(ctx);
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

		await ctx.runMutation(internal.workspaces.removeMemberInternal, {
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

		await ctx.runMutation(internal.workspaces.setMemberRoleInternal, {
			workspaceId,
			userId: targetUserId,
			role,
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

		await ctx.runMutation(internal.workspaces.removeMemberInternal, {
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
