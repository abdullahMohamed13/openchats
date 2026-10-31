import { v } from "convex/values";

import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

type DocWithId = { _id?: string; id?: string };

const docId = (doc: unknown): string | null => {
	const candidate = doc as DocWithId | null;
	return candidate?._id ?? candidate?.id ?? null;
};

export const changeUsername = mutation({
	args: { username: v.string() },
	handler: async (ctx, { username }) => {
		const user = await authComponent.getAuthUser(ctx);
		const userId = String(user._id);
		const normalized = username.trim().toLowerCase();

		if (!USERNAME_PATTERN.test(normalized)) {
			throw new Error(
				"Usernames must be 3-20 characters using lowercase letters, numbers, dots, or underscores",
			);
		}

		const currentUsername =
			typeof user.username === "string" ? user.username.toLowerCase() : null;
		if (currentUsername === normalized) {
			return { username: normalized };
		}

		const claim = await ctx.db
			.query("usernameClaims")
			.withIndex("username", (q) => q.eq("username", normalized))
			.first();
		if (claim && claim.userId !== userId) {
			throw new Error("This username is already taken");
		}

		const existing = await ctx.runQuery(
			components.betterAuth.adapter.findOne,
			{
				model: "user",
				where: [{ field: "username", operator: "eq", value: normalized }],
				select: ["id"],
			},
		);
		const existingId = docId(existing);
		if (existingId && existingId !== userId) {
			throw new Error("This username is already taken");
		}

		const oldClaims = await ctx.db
			.query("usernameClaims")
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();
		for (const oldClaim of oldClaims) {
			if (oldClaim.username !== normalized) {
				await ctx.db.delete(oldClaim._id);
			}
		}

		if (!claim) {
			await ctx.db.insert("usernameClaims", {
				username: normalized,
				userId,
			});
		}

		await ctx.runMutation(components.betterAuth.adapter.updateOne, {
			input: {
				model: "user",
				where: [{ field: "_id", operator: "eq", value: userId }],
				update: { username: normalized },
			},
		});

		return { username: normalized };
	},
});
