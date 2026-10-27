import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { getAuthUserId, requireAdmin, requireAdminForAction } from "./access";
import { authComponent } from "./auth";
import { addUserToWorkspaceChannels } from "./channels";
import { sendWorkspaceInviteEmail } from "./email";
import { getStreamServerAuth, upsertStreamUser } from "./stream";

type DocWithId = { _id?: string; id?: string };
type UserDoc = {
	name?: string | null;
	username?: string | null;
	email?: string | null;
	image?: string | null;
};

const docId = (doc: unknown): string | null => {
	const candidate = doc as DocWithId | null;
	return candidate?._id ?? candidate?.id ?? null;
};

function generateInviteToken(): string {
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function siteBaseUrl(): string {
	const configured = process.env.SITE_URL?.trim();
	return (configured || "http://localhost:3000").replace(/\/+$/, "");
}

function normalizeEmail(value: string): string {
	return value.trim().toLowerCase();
}

export const getInviteInternal = internalQuery({
	args: { token: v.string() },
	handler: async (ctx, { token }) =>
		await ctx.db
			.query("workspaceInvites")
			.withIndex("token", (q) => q.eq("token", token))
			.first(),
});

export const getInvite = query({
	args: { token: v.string() },
	handler: async (ctx, { token }) => {
		const invite = await ctx.db
			.query("workspaceInvites")
			.withIndex("token", (q) => q.eq("token", token))
			.first();
		if (!invite) return { status: "invalid" as const };

		const workspace = await ctx.db.get(invite.workspaceId);
		if (!workspace) return { status: "invalid" as const };

		const inviter = await ctx.runQuery(
			components.betterAuth.adapter.findOne,
			{
				model: "user",
				where: [
					{ field: "_id", operator: "eq", value: invite.createdBy },
				],
				select: ["name", "username"],
			},
		);
		const inviterDoc = inviter as UserDoc | null;
		const expired = invite.expiresAt <= Date.now();
		const used = invite.usedAt !== undefined;

		return {
			status: expired ? ("expired" as const) : used ? ("used" as const) : ("valid" as const),
			workspaceId: invite.workspaceId,
			workspaceName: workspace.name,
			kind: invite.kind,
			role: invite.role,
			email: invite.email ?? null,
			inviterName:
				inviterDoc?.name?.trim() ||
				inviterDoc?.username ||
				"A teammate",
			expiresAt: invite.expiresAt,
		};
	},
});

export const insertInvite = internalMutation({
	args: {
		workspaceId: v.id("workspaces"),
		token: v.string(),
		kind: v.union(v.literal("link"), v.literal("email")),
		role: v.union(v.literal("admin"), v.literal("member")),
		createdBy: v.string(),
		email: v.optional(v.string()),
		expiresAt: v.number(),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("workspaceInvites", {
			...args,
			createdAt: now,
		});
	},
});

export const deleteInviteById = internalMutation({
	args: { inviteId: v.id("workspaceInvites") },
	handler: async (ctx, { inviteId }) => {
		await ctx.db.delete(inviteId);
	},
});

export const markInviteUsed = internalMutation({
	args: {
		inviteId: v.id("workspaceInvites"),
		userId: v.string(),
	},
	handler: async (ctx, { inviteId, userId }) => {
		await ctx.db.patch(inviteId, { usedAt: Date.now(), usedBy: userId });
	},
});

export const createLinkInvite = mutation({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);

		const now = Date.now();
		const invites = await ctx.db
			.query("workspaceInvites")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();
		const active = invites.find(
			(invite) =>
				invite.kind === "link" &&
				invite.usedAt === undefined &&
				invite.expiresAt > now,
		);
		if (active) return { token: active.token };

		const token = generateInviteToken();
		await ctx.db.insert("workspaceInvites", {
			workspaceId,
			token,
			kind: "link",
			role: "member",
			createdBy: userId,
			expiresAt: now + 30 * 24 * 60 * 60 * 1000,
			createdAt: now,
		});

		return { token };
	},
});

export const listWorkspaceInvites = query({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);

		const invites = await ctx.db
			.query("workspaceInvites")
			.withIndex("workspaceId", (q) => q.eq("workspaceId", workspaceId))
			.collect();

		return invites
			.sort((a, b) => b.createdAt - a.createdAt)
			.map((invite) => ({
				_id: invite._id,
				token: invite.kind === "link" ? invite.token : null,
				kind: invite.kind,
				role: invite.role,
				email: invite.email ?? null,
				expiresAt: invite.expiresAt,
				createdAt: invite.createdAt,
				usedAt: invite.usedAt ?? null,
			}));
	},
});

export const revokeInvite = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		inviteId: v.id("workspaceInvites"),
	},
	handler: async (ctx, { workspaceId, inviteId }) => {
		const userId = await getAuthUserId(ctx);
		await requireAdmin(ctx, workspaceId, userId);

		const invite = await ctx.db.get(inviteId);
		if (!invite || invite.workspaceId !== workspaceId) {
			throw new Error("Invite not found");
		}

		await ctx.db.delete(inviteId);
	},
});

export const inviteByEmail = action({
	args: {
		workspaceId: v.id("workspaces"),
		email: v.string(),
	},
	handler: async (ctx, { workspaceId, email }): Promise<{ status: "sent" | "already_member" }> => {
		const user = await authComponent.getAuthUser(ctx);
		const userId = String(user._id);
		await requireAdminForAction(ctx, workspaceId, userId);

		const normalizedEmail = normalizeEmail(email);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
			throw new Error("Enter a valid email address");
		}

		const target = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "email", operator: "eq", value: normalizedEmail }],
			select: ["id", "name", "email"],
		});
		const targetId = docId(target);
		if (targetId) {
			const membership = await ctx.runQuery(
				internal.access.getMembershipInternal,
				{ workspaceId, userId: targetId },
			);
			if (membership) return { status: "already_member" };
		}

		const workspace = await ctx.runQuery(
			internal.access.getWorkspaceInternal,
			{ workspaceId },
		);
		if (!workspace) throw new Error("Workspace not found");

		const token = generateInviteToken();
		const inviteId = await ctx.runMutation(internal.invites.insertInvite, {
			workspaceId,
			token,
			kind: "email",
			role: "member",
			createdBy: userId,
			email: normalizedEmail,
			expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
		});

		try {
			await sendWorkspaceInviteEmail({
				to: normalizedEmail,
				workspaceName: workspace.name,
				inviterName:
					user.name?.trim() ||
					user.username ||
					user.email ||
					"A teammate",
				url: `${siteBaseUrl()}/invite/${token}`,
			});
		} catch (error) {
			await ctx.runMutation(internal.invites.deleteInviteById, { inviteId });
			throw error;
		}

		return { status: "sent" };
	},
});

export const inviteByUsername = action({
	args: {
		workspaceId: v.id("workspaces"),
		username: v.string(),
	},
	handler: async (ctx, { workspaceId, username }): Promise<{ status: "added" | "already_member"; name: string }> => {
		const user = await authComponent.getAuthUser(ctx);
		const userId = String(user._id);
		await requireAdminForAction(ctx, workspaceId, userId);

		const normalizedUsername = username.trim().toLowerCase().replace(/^@/, "");
		if (!normalizedUsername) {
			throw new Error("Enter a username");
		}

		const target = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [
				{ field: "username", operator: "eq", value: normalizedUsername },
			],
			select: ["id", "name", "username", "image"],
		});
		const targetDoc = target as UserDoc | null;
		const targetId = docId(target);
		if (!targetDoc || !targetId) {
			throw new Error("No OpenChats user has that username");
		}
		if (targetId === userId) {
			throw new Error("That's you");
		}

		const displayName =
			targetDoc.name?.trim() ||
			targetDoc.username ||
			targetDoc.email ||
			targetId;

		const membership = await ctx.runQuery(
			internal.access.getMembershipInternal,
			{ workspaceId, userId: targetId },
		);
		if (membership) {
			const auth = await getStreamServerAuth();
			await upsertStreamUser(auth, {
				id: targetId,
				name: displayName,
				image: targetDoc.image ?? undefined,
			});
			await addUserToWorkspaceChannels(ctx, auth, workspaceId, targetId);
			return { status: "already_member", name: displayName };
		}

		await ctx.runMutation(internal.workspaces.addMemberInternal, {
			workspaceId,
			userId: targetId,
			role: "member",
		});

		const auth = await getStreamServerAuth();
		await upsertStreamUser(auth, {
			id: targetId,
			name: displayName,
			image: targetDoc.image ?? undefined,
		});
		await addUserToWorkspaceChannels(ctx, auth, workspaceId, targetId);

		return { status: "added", name: displayName };
	},
});

export const acceptInvite = action({
	args: { token: v.string() },
	handler: async (ctx, { token }): Promise<{ workspaceId: string }> => {
		const user = await authComponent.getAuthUser(ctx);
		const userId = String(user._id);

		const invite = await ctx.runQuery(internal.invites.getInviteInternal, {
			token,
		});
		if (!invite) throw new Error("This invite link is invalid");
		if (invite.expiresAt <= Date.now()) {
			throw new Error("This invite has expired");
		}
		if (invite.usedAt !== undefined && invite.usedBy !== userId) {
			throw new Error("This invite has already been used");
		}
		if (invite.kind === "email") {
			const userEmail = normalizeEmail(user.email ?? "");
			if (!userEmail || userEmail !== invite.email) {
				throw new Error(
					"This invite was sent to a different email address. Sign in with that account to join.",
				);
			}
		}

		const existing = await ctx.runQuery(
			internal.access.getMembershipInternal,
			{ workspaceId: invite.workspaceId, userId },
		);
		if (!existing) {
			await ctx.runMutation(internal.workspaces.addMemberInternal, {
				workspaceId: invite.workspaceId,
				userId,
				role: invite.role,
			});
		}

		const auth = await getStreamServerAuth();
		await upsertStreamUser(auth, {
			id: userId,
			name:
				user.name?.trim() ||
				user.username ||
				user.email ||
				userId,
			image: user.image ?? undefined,
		});
		await addUserToWorkspaceChannels(
			ctx,
			auth,
			invite.workspaceId,
			userId,
		);

		if (invite.kind === "email" && invite.usedAt === undefined) {
			await ctx.runMutation(internal.invites.markInviteUsed, {
				inviteId: invite._id,
				userId,
			});
		}

		return { workspaceId: String(invite.workspaceId) };
	},
});
