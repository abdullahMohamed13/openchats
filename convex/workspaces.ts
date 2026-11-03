import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
	action,
	internalMutation,
	mutation,
	query,
} from "./_generated/server";
import {
	getAuthUserId,
	requireAdmin,
	requireAdminForAction,
	requireFullAccount,
	requireMembershipForAction,
} from "./access";
import { authComponent } from "./auth";
import { deleteWorkspaceChannels } from "./channels";
import {
	createWorkspaceChannel,
	getStreamServerAuth,
	upsertStreamUser,
} from "./stream";
import { normalizeWorkspaceName } from "./utils/normalizeWorkspaceName";
import { slugifyName } from "./utils/slugifyName";
import { workspaceNameKey } from "./utils/workspaceNameKey";

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

export const insertWorkspace = internalMutation({
	args: {
		name: v.string(),
		ownerId: v.string(),
	},
	handler: async (ctx, { name, ownerId }) => {
		const nameKey = workspaceNameKey(name);
		const ownedWorkspaces = await ctx.db
			.query("workspaces")
			.withIndex("ownerId", (q) => q.eq("ownerId", ownerId))
			.collect();

		if (
			ownedWorkspaces.some(
				(workspace) => workspaceNameKey(workspace.name) === nameKey,
			)
		) {
			throw new Error(`You already have a workspace named “${name}”`);
		}

		const baseSlug = slugifyName(name) || "workspace";
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

export const renameWorkspaceData = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
	},
	handler: async (ctx, { workspaceId, name }) => {
		const workspace = await ctx.db.get(workspaceId);
		if (!workspace) throw new Error("Workspace not found");

		const nameKey = workspaceNameKey(name);
		const ownedWorkspaces = await ctx.db
			.query("workspaces")
			.withIndex("ownerId", (q) => q.eq("ownerId", workspace.ownerId))
			.collect();

		if (
			ownedWorkspaces.some(
				(other) =>
					other._id !== workspaceId &&
					workspaceNameKey(other.name) === nameKey,
			)
		) {
			throw new Error(`You already have a workspace named “${name}”`);
		}

		await ctx.db.patch(workspaceId, { name });
	},
});

export const createWorkspace = action({
	args: {
		name: v.string(),
	},
	handler: async (ctx, { name }): Promise<{ workspaceId: Id<"workspaces"> }> => {
		const user = await requireFullAccount(ctx);
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
		await requireFullAccount(ctx);
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
		await requireFullAccount(ctx);
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
		await requireFullAccount(ctx);
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
		await requireFullAccount(ctx);
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
		await requireFullAccount(ctx);
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

