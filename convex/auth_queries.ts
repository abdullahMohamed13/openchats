import { query } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

export const accountEmailExists = query({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "email", operator: "eq", value: email.trim().toLowerCase() }],
			select: ["id"],
		});
		return !!user;
	},
});
