import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { components, internal } from "./_generated/api";
import {
	action,
	internalAction,
	internalMutation,
	type MutationCtx,
} from "./_generated/server";
import { authComponent } from "./auth";
import {
	addUserToChannel,
	createWorkspaceChannel,
	getStreamServerAuth,
	removeUserFromChannel,
	sendChannelMessage,
	upsertStreamUser,
} from "./stream";

export const GUEST_SHARED_SLUG = "guest-lounge";
export const GUEST_SHARED_NAME = "Guest Lounge";
export const GUEST_PRIVATE_NAME = "My Guest Space";
export const GUEST_AVATAR = "/images/guest-avatar.png";
const GUEST_SYSTEM_OWNER_ID = "system:guest";

const SHARED_WELCOME = [
	"Welcome to the Guest Lounge — a shared workspace for everyone trying OpenChats as a guest.",
	"",
	"As a member here you can send messages, upload files, search, and edit or delete your own messages.",
	"Workspace settings, invites, new channels, direct messages, and profile changes are locked until you create an account.",
].join("\n");

const PRIVATE_WELCOME = [
	"Welcome to your private guest workspace.",
	"",
	"This workspace is yours, so it shows what the owner experience looks like in OpenChats. As its owner you can manage the workspace, channels, members, roles, and invites once you have a full account.",
	"Create an account to unlock those owner tools, direct messages, and profile customization. Your messages here stay with you.",
].join("\n");

type ChannelRow = {
	_id: Id<"channels">;
	streamId: string;
	name: string;
	welcomeSentAt?: number;
};

async function ensureChannelRows(
	ctx: MutationCtx,
	workspaceId: Id<"workspaces">,
	createdBy: string,
): Promise<ChannelRow[]> {
	const rows: ChannelRow[] = [];
	for (const name of ["welcome", "general"]) {
		const existing = await ctx.db
			.query("channels")
			.withIndex("workspaceId_name", (q) =>
				q.eq("workspaceId", workspaceId).eq("name", name),
			)
			.first();
		if (existing) {
			rows.push(existing);
			continue;
		}

		const channelId = await ctx.db.insert("channels", {
			workspaceId,
			streamId: `${workspaceId}-${name}`,
			name,
			createdBy,
			createdAt: Date.now(),
		});
		rows.push((await ctx.db.get(channelId))!);
	}
	return rows;
}

function docId(doc: unknown): string | null {
	const candidate = doc as { _id?: string; id?: string } | null;
	return candidate?._id ?? candidate?.id ?? null;
}

export const ensureGuestSetupData = internalMutation({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, { userId }) => {
		const now = Date.now();

		let shared = await ctx.db
			.query("workspaces")
			.withIndex("slug", (q) => q.eq("slug", GUEST_SHARED_SLUG))
			.first();
		if (!shared) {
			const sharedId = await ctx.db.insert("workspaces", {
				name: GUEST_SHARED_NAME,
				slug: GUEST_SHARED_SLUG,
				ownerId: GUEST_SYSTEM_OWNER_ID,
				kind: "guest-shared",
				createdAt: now,
			});
			shared = (await ctx.db.get(sharedId))!;
		} else if (shared.kind !== "guest-shared") {
			await ctx.db.patch(shared._id, { kind: "guest-shared" });
		}

		const sharedMembership = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", shared._id).eq("userId", userId),
			)
			.first();
		if (!sharedMembership) {
			await ctx.db.insert("workspaceMembers", {
				workspaceId: shared._id,
				userId,
				role: "member",
				joinedAt: now,
			});
		}

		const owned = await ctx.db
			.query("workspaces")
			.withIndex("ownerId", (q) => q.eq("ownerId", userId))
			.collect();
		let privateWorkspace = owned.find(
			(workspace) => workspace.kind === "guest-private",
		);
		if (!privateWorkspace) {
			const privateId = await ctx.db.insert("workspaces", {
				name: GUEST_PRIVATE_NAME,
				slug: `guest-${userId}`,
				ownerId: userId,
				kind: "guest-private",
				createdAt: now + 1,
			});
			privateWorkspace = (await ctx.db.get(privateId))!;
		}

		const privateMembership = await ctx.db
			.query("workspaceMembers")
			.withIndex("workspaceId_userId", (q) =>
				q.eq("workspaceId", privateWorkspace!._id).eq("userId", userId),
			)
			.first();
		if (privateMembership) {
			if (privateMembership.role !== "owner") {
				await ctx.db.patch(privateMembership._id, { role: "owner" });
			}
		} else {
			await ctx.db.insert("workspaceMembers", {
				workspaceId: privateWorkspace._id,
				userId,
				role: "owner",
				joinedAt: now + 1,
			});
		}

		const sharedChannels = await ensureChannelRows(
			ctx,
			shared._id,
			GUEST_SYSTEM_OWNER_ID,
		);
		const privateChannels = await ensureChannelRows(
			ctx,
			privateWorkspace._id,
			userId,
		);

		return {
			sharedWorkspaceId: shared._id,
			privateWorkspaceId: privateWorkspace._id,
			sharedChannels,
			privateChannels,
		};
	},
});

export const markChannelWelcomeSent = internalMutation({
	args: { channelId: v.id("channels") },
	handler: async (ctx, { channelId }) => {
		await ctx.db.patch(channelId, { welcomeSentAt: Date.now() });
	},
});

export const setupGuest = action({
	args: {},
	handler: async (ctx): Promise<{
		sharedWorkspaceId: string;
		privateWorkspaceId: string;
	}> => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user.isAnonymous) {
			throw new Error("Guest setup is only available for guest accounts");
		}

		const userIdStr = String(user._id);
		const base = `guest_${userIdStr.slice(0, 4).toLowerCase()}`;
		let username =
			typeof user.username === "string" && user.username.startsWith("guest_")
				? user.username
				: base;

		if (username !== user.username) {
			let suffix = 2;
			while (true) {
				const existing = await ctx.runQuery(
					components.betterAuth.adapter.findOne,
					{
						model: "user",
						where: [
							{ field: "username", operator: "eq", value: username },
						],
						select: ["id"],
					},
				);
				const existingId = docId(existing);
				if (!existingId || existingId === userIdStr) break;
				username = `${base}_${suffix}`;
				suffix += 1;
			}
		}

		const data = await ctx.runMutation(internal.guest.ensureGuestSetupData, {
			userId: userIdStr,
		});

		const auth = await getStreamServerAuth();
		await upsertStreamUser(auth, {
			id: userIdStr,
			name: username,
			image: GUEST_AVATAR,
		});

		const workspaceChannels: {
			workspaceId: Id<"workspaces">;
			channels: ChannelRow[];
			welcome: string;
		}[] = [
			{
				workspaceId: data.sharedWorkspaceId,
				channels: data.sharedChannels,
				welcome: SHARED_WELCOME,
			},
			{
				workspaceId: data.privateWorkspaceId,
				channels: data.privateChannels,
				welcome: PRIVATE_WELCOME,
			},
		];

		for (const workspace of workspaceChannels) {
			for (const channel of workspace.channels) {
				await createWorkspaceChannel(auth, {
					workspaceId: String(workspace.workspaceId),
					userId: userIdStr,
					name: channel.name,
					slug: channel.name,
					memberIds: [userIdStr],
				});

				if (channel.name === "welcome" && channel.welcomeSentAt === undefined) {
					try {
						await sendChannelMessage(
							auth,
							channel.streamId,
							userIdStr,
							workspace.welcome,
						);
						await ctx.runMutation(
							internal.guest.markChannelWelcomeSent,
							{ channelId: channel._id },
						);
					} catch (error) {
						console.warn("Could not seed guest welcome message", error);
					}
				}
			}
		}

		await ctx.runMutation(components.betterAuth.adapter.updateOne, {
			input: {
				model: "user",
				where: [{ field: "_id", operator: "eq", value: userIdStr }],
				update: {
					name: username,
					username,
					image: GUEST_AVATAR,
					role: "Guest",
					badge: null,
					onboarded: true,
				},
			},
		});

		return {
			sharedWorkspaceId: String(data.sharedWorkspaceId),
			privateWorkspaceId: String(data.privateWorkspaceId),
		};
	},
});

export const linkGuestToAccount = internalMutation({
	args: {
		anonymousUserId: v.string(),
		newUserId: v.string(),
	},
	handler: async (ctx, { anonymousUserId, newUserId }) => {
		const shared = await ctx.db
			.query("workspaces")
			.withIndex("slug", (q) => q.eq("slug", GUEST_SHARED_SLUG))
			.first();

		const owned = await ctx.db
			.query("workspaces")
			.withIndex("ownerId", (q) => q.eq("ownerId", anonymousUserId))
			.collect();
		const privateWorkspace = owned.find(
			(workspace) => workspace.kind === "guest-private",
		);

		const privateWorkspaceIds = new Set<Id<"workspaces">>();
		if (privateWorkspace) {
			privateWorkspaceIds.add(privateWorkspace._id);
			await ctx.db.patch(privateWorkspace._id, {
				ownerId: newUserId,
				kind: undefined,
			});

			const privateMembership = await ctx.db
				.query("workspaceMembers")
				.withIndex("workspaceId_userId", (q) =>
					q
						.eq("workspaceId", privateWorkspace._id)
						.eq("userId", anonymousUserId),
				)
				.first();
			if (privateMembership) {
				await ctx.db.patch(privateMembership._id, {
					userId: newUserId,
					role: "owner",
				});
			} else {
				await ctx.db.insert("workspaceMembers", {
					workspaceId: privateWorkspace._id,
					userId: newUserId,
					role: "owner",
					joinedAt: Date.now(),
				});
			}

			const channels = await ctx.db
				.query("channels")
				.withIndex("workspaceId", (q) =>
					q.eq("workspaceId", privateWorkspace._id),
				)
				.collect();
			for (const channel of channels) {
				if (channel.createdBy === anonymousUserId) {
					await ctx.db.patch(channel._id, { createdBy: newUserId });
				}
			}
		}

		const memberships = await ctx.db
			.query("workspaceMembers")
			.withIndex("userId", (q) => q.eq("userId", anonymousUserId))
			.collect();
		for (const membership of memberships) {
			if (!privateWorkspaceIds.has(membership.workspaceId)) {
				await ctx.db.delete(membership._id);
			}
		}

		return {
			sharedWorkspaceId: shared?._id ?? null,
			privateWorkspaceId: privateWorkspace?._id ?? null,
		};
	},
});

export const finalizeGuestUpgrade = internalAction({
	args: {
		anonymousUserId: v.string(),
		newUserId: v.string(),
		newUserName: v.string(),
		newUserImage: v.optional(v.string()),
		sharedWorkspaceId: v.optional(v.id("workspaces")),
		privateWorkspaceId: v.optional(v.id("workspaces")),
	},
	handler: async (
		ctx,
		{
			anonymousUserId,
			newUserId,
			newUserName,
			newUserImage,
			sharedWorkspaceId,
			privateWorkspaceId,
		},
	) => {
		const auth = await getStreamServerAuth();
		await upsertStreamUser(auth, {
			id: newUserId,
			name: newUserName,
			image: newUserImage,
		});

		if (sharedWorkspaceId) {
			const channels = await ctx.runQuery(
				internal.channels.listForWorkspace,
				{ workspaceId: sharedWorkspaceId },
			);
			for (const channel of channels) {
				await removeUserFromChannel(auth, channel.streamId, anonymousUserId);
			}
		}

		if (privateWorkspaceId) {
			const channels = await ctx.runQuery(
				internal.channels.listForWorkspace,
				{ workspaceId: privateWorkspaceId },
			);
			for (const channel of channels) {
				await removeUserFromChannel(auth, channel.streamId, anonymousUserId);
				await addUserToChannel(auth, channel.streamId, newUserId);
			}
		}
	},
});