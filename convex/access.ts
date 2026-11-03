import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
	internalQuery,
	type ActionCtx,
	type MutationCtx,
	type QueryCtx,
} from "./_generated/server";
import { authComponent } from "./auth";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;
type DbCtx = QueryCtx | MutationCtx;

export async function getAuthUserId(ctx: AuthCtx): Promise<string> {
	const user = await authComponent.getAuthUser(ctx);
	return String(user._id);
}

/**
 * Guests can read and chat in their guest workspaces, but account-level actions
 * (creating workspaces/channels, invites, profile changes, etc.) require a
 * permanent account.
 */
export async function requireFullAccount(ctx: AuthCtx) {
	const user = await authComponent.getAuthUser(ctx);
	if (user.isAnonymous) {
		throw new Error("Create an account to use this feature");
	}
	return user;
}

export async function getMembership(
	ctx: DbCtx,
	workspaceId: Id<"workspaces">,
	userId: string,
) {
	return await ctx.db
		.query("workspaceMembers")
		.withIndex("workspaceId_userId", (q) =>
			q.eq("workspaceId", workspaceId).eq("userId", userId),
		)
		.first();
}

export async function requireMembership(
	ctx: DbCtx,
	workspaceId: Id<"workspaces">,
	userId: string,
) {
	const membership = await getMembership(ctx, workspaceId, userId);
	if (!membership) {
		throw new Error("You are not a member of this workspace");
	}
	return membership;
}

export async function requireAdmin(
	ctx: DbCtx,
	workspaceId: Id<"workspaces">,
	userId: string,
) {
	const membership = await requireMembership(ctx, workspaceId, userId);
	if (membership.role !== "owner" && membership.role !== "admin") {
		throw new Error("You need admin access to do that");
	}
	return membership;
}

export const getMembershipInternal = internalQuery({
	args: { workspaceId: v.id("workspaces"), userId: v.string() },
	handler: async (ctx, { workspaceId, userId }) =>
		getMembership(ctx, workspaceId, userId),
});

export const getWorkspaceInternal = internalQuery({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, { workspaceId }) => ctx.db.get(workspaceId),
});

export async function requireMembershipForAction(
	ctx: ActionCtx,
	workspaceId: Id<"workspaces">,
	userId: string,
) {
	const membership = await ctx.runQuery(internal.access.getMembershipInternal, {
		workspaceId,
		userId,
	});
	if (!membership) {
		throw new Error("You are not a member of this workspace");
	}
	return membership;
}

export async function requireAdminForAction(
	ctx: ActionCtx,
	workspaceId: Id<"workspaces">,
	userId: string,
) {
	const membership = await requireMembershipForAction(ctx, workspaceId, userId);
	if (membership.role !== "owner" && membership.role !== "admin") {
		throw new Error("You need admin access to do that");
	}
	return membership;
}
