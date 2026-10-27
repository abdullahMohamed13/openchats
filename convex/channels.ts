import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	query,
	type ActionCtx,
} from "./_generated/server";
import { getAuthUserId, requireMembership, requireMembershipForAction } from "./access";
import { authComponent } from "./auth";
import {
	addUserToChannel,
	createWorkspaceChannel,
	deleteStreamChannel,
	getStreamServerAuth,
	removeUserFromChannel,
	slugifyChannelName,
	upsertStreamUser,
	type StreamServerAuth,
} from "./stream";

export const listForWorkspace = internalQuery({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) =>
		await ctx.db
			.query("channels")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect(),
});

export const getChannelRow = internalQuery({
	args: { channelId: v.id("channels") },
	handler: async (ctx, { channelId }) => ctx.db.get(channelId),
});

export const listWorkspaceChannels = query({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => {
		const userId = await getAuthUserId(ctx);
		await requireMembership(ctx, workspaceId, userId);

		const rows = await ctx.db
			.query("channels")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();

		return rows
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((channel) => ({
				_id: channel._id,
				streamId: channel.streamId,
				name: channel.name,
				createdBy: channel.createdBy,
				createdAt: channel.createdAt,
			}));
	},
});

export const ensureGeneral = internalMutation({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => {
		const existing = await ctx.db
			.query("channels")
			.withIndex("workspaceId_name", (q) =>
				q.eq("workspaceId", workspaceId).eq("name", "general"),
			)
			.first();
		if (existing) return existing;

		const workspace = await ctx.db.get(workspaceId);
		if (!workspace) throw new Error("Workspace not found");

		const channelId = await ctx.db.insert("channels", {
			workspaceId,
			streamId: `${workspaceId}-general`,
			name: "general",
			createdBy: workspace.ownerId,
			createdAt: Date.now(),
		});
		return (await ctx.db.get(channelId))!;
	},
});

export const insertChannel = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
		createdBy: v.string(),
	},
	handler: async (ctx, { workspaceId, name, createdBy }) => {
		const base = slugifyChannelName(name) || "channel";
		let slug = base;
		let suffix = 2;

		while (
			await ctx.db
				.query("channels")
				.withIndex("workspaceId_name", (q) =>
					q.eq("workspaceId", workspaceId).eq("name", slug),
				)
				.first()
		) {
			slug = `${base}-${suffix}`;
			suffix += 1;
		}

		const channelId = await ctx.db.insert("channels", {
			workspaceId,
			streamId: `${workspaceId}-${slug}`,
			name: slug,
			createdBy,
			createdAt: Date.now(),
		});

		return { channelId, streamId: `${workspaceId}-${slug}`, name: slug };
	},
});

export const deleteChannelRow = internalMutation({
	args: { channelId: v.id("channels") },
	handler: async (ctx, { channelId }) => {
		await ctx.db.delete(channelId);
	},
});

export async function addUserToWorkspaceChannels(
	ctx: ActionCtx,
	auth: StreamServerAuth,
	workspaceId: Id<"workspaces">,
	userId: string,
): Promise<void> {
	await ctx.runMutation(internal.channels.ensureGeneral, { workspaceId });
	const channels = await ctx.runQuery(internal.channels.listForWorkspace, {
		workspaceId,
	});
	for (const channel of channels) {
		await addUserToChannel(auth, channel.streamId, userId);
	}
}

export async function removeUserFromWorkspaceChannels(
	ctx: ActionCtx,
	auth: StreamServerAuth,
	workspaceId: Id<"workspaces">,
	userId: string,
): Promise<void> {
	const channels = await ctx.runQuery(internal.channels.listForWorkspace, {
		workspaceId,
	});
	for (const channel of channels) {
		await removeUserFromChannel(auth, channel.streamId, userId);
	}
}

export async function deleteWorkspaceChannels(
	ctx: ActionCtx,
	auth: StreamServerAuth,
	workspaceId: Id<"workspaces">,
): Promise<void> {
	const channels = await ctx.runQuery(internal.channels.listForWorkspace, {
		workspaceId,
	});
	for (const channel of channels) {
		await deleteStreamChannel(auth, channel.streamId);
	}
}

export const createChannel = action({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
	},
	handler: async (ctx, { workspaceId, name }): Promise<{ channelId: string; name: string }> => {
		const user = await authComponent.getAuthUser(ctx);
		const userId = String(user._id);
		await requireMembershipForAction(ctx, workspaceId, userId);

		const trimmed = name.trim().replace(/\s+/g, " ");
		if (trimmed.length < 1 || trimmed.length > 40) {
			throw new Error("Channel name must be between 1 and 40 characters");
		}

		const { channelId, streamId, name: slug } = await ctx.runMutation(
			internal.channels.insertChannel,
			{ workspaceId, name: trimmed, createdBy: userId },
		);

		try {
			const auth = await getStreamServerAuth();
			const members: {
				userId: string;
				name: string;
				image: string | null;
			}[] = await ctx.runQuery(
				internal.workspaces.listMemberProfilesInternal,
				{ workspaceId },
			);

			for (const member of members) {
				await upsertStreamUser(auth, {
					id: member.userId,
					name: member.name,
					image: member.image ?? undefined,
				});
			}

			await createWorkspaceChannel(auth, {
				workspaceId,
				userId,
				name: trimmed,
				slug,
				memberIds: members.map((member) => member.userId),
			});
		} catch (error) {
			await ctx.runMutation(internal.channels.deleteChannelRow, { channelId });
			throw error;
		}

		return { channelId: streamId, name: slug };
	},
});
