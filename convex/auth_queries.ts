import { query } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { authComponent } from "./auth";

export const getEmailByUsername = query({
	args: { username: v.string() },
	handler: async (ctx, { username }) => {
		const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "username", operator: "eq", value: username }],
			select: ["email"],
		});
		if (!user) return null;
		return (user as { email?: string }).email ?? null;
	},
});

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx);
	},
});
