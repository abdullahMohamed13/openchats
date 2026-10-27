import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	signInAttempts: defineTable({
		username: v.string(),
		count: v.number(),
		windowStart: v.number(),
	}).index("username", ["username"]),
	usernameClaims: defineTable({
		username: v.string(),
		userId: v.string(),
	}).index("username", ["username"]),
	workspaces: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: v.string(),
		createdAt: v.number(),
	})
		.index("slug", ["slug"])
		.index("ownerId", ["ownerId"]),
	workspaceMembers: defineTable({
		workspaceId: v.id("workspaces"),
		userId: v.string(),
		role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
		joinedAt: v.number(),
	})
		.index("userId", ["userId"])
		.index("workspaceId", ["workspaceId"])
		.index("workspaceId_userId", ["workspaceId", "userId"]),
	workspaceInvites: defineTable({
		workspaceId: v.id("workspaces"),
		token: v.string(),
		kind: v.union(v.literal("link"), v.literal("email")),
		role: v.union(v.literal("admin"), v.literal("member")),
		createdBy: v.string(),
		email: v.optional(v.string()),
		expiresAt: v.number(),
		usedAt: v.optional(v.number()),
		usedBy: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("token", ["token"])
		.index("workspaceId", ["workspaceId"])
		.index("email", ["email"]),
	channels: defineTable({
		workspaceId: v.id("workspaces"),
		streamId: v.string(),
		name: v.string(),
		createdBy: v.string(),
		createdAt: v.number(),
	})
		.index("workspaceId", ["workspaceId"])
		.index("streamId", ["streamId"])
		.index("workspaceId_name", ["workspaceId", "name"]),
});