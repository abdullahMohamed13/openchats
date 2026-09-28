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
});