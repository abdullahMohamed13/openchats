import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import { verifyPassword } from "better-auth/crypto";

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

type DocWithId = { _id?: string; id?: string };

const docId = (doc: unknown): string | null => {
	const candidate = doc as DocWithId | null;
	return candidate?._id ?? candidate?.id ?? null;
};

export const getSignInAttempts = query({
	args: { username: v.string() },
	handler: async (ctx, { username }) => {
		return (
			(await ctx.db
				.query("signInAttempts")
				.withIndex("username", (q) => q.eq("username", username))
				.first()) ?? null
		);
	},
});

export const recordFailedAttempt = mutation({
	args: { username: v.string() },
	handler: async (ctx, { username }) => {
		const now = Date.now();
		const existing = await ctx.db
			.query("signInAttempts")
			.withIndex("username", (q) => q.eq("username", username))
			.first();
		if (!existing) {
			await ctx.db.insert("signInAttempts", { username, count: 1, windowStart: now });
			return;
		}
		if (now - existing.windowStart > ATTEMPT_WINDOW_MS) {
			await ctx.db.patch(existing._id, { count: 1, windowStart: now });
		} else {
			await ctx.db.patch(existing._id, { count: existing.count + 1 });
		}
	},
});

export const clearSignInAttempts = mutation({
	args: { username: v.string() },
	handler: async (ctx, { username }) => {
		const existing = await ctx.db
			.query("signInAttempts")
			.withIndex("username", (q) => q.eq("username", username))
			.first();
		if (existing) await ctx.db.delete(existing._id);
	},
});

export const signInByUsername = action({
	args: { username: v.string(), password: v.string() },
	handler: async (ctx, { username, password }) => {
		const attempts = await ctx.runQuery(api.username.getSignInAttempts, { username });
		if (
			attempts &&
			attempts.count >= MAX_FAILED_ATTEMPTS &&
			Date.now() - attempts.windowStart < ATTEMPT_WINDOW_MS
		) {
			return { ok: false as const, error: "Too many attempts. Try again in a few minutes." };
		}

		let email: string | null = null;
		let valid = false;
		try {
			const claim = await ctx.runQuery(api.username.findUsernameClaim, { username });
			const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
				model: "user",
				where: claim
					? [{ field: "_id", operator: "eq", value: claim.userId }]
					: [{ field: "username", operator: "eq", value: username }],
				select: ["id", "email"],
			});
			const safeUser = user as { email?: string } | null;
			const selectId = docId(user);
			if (safeUser && selectId) {
				const account = await ctx.runQuery(components.betterAuth.adapter.findOne, {
					model: "account",
					where: [
						{ field: "accountId", operator: "eq", value: selectId },
						{ field: "providerId", operator: "eq", value: "credential" },
					],
					select: ["password"],
				});
				const hash = (account as { password?: string } | null)?.password;
				if (!hash) {
					const fallback = await ctx.runQuery(components.betterAuth.adapter.findOne, {
						model: "account",
						where: [
							{ field: "userId", operator: "eq", value: selectId },
							{ field: "providerId", operator: "eq", value: "credential" },
						],
						select: ["password"],
					});
					if (fallback) {
						const fallbackHash = (fallback as { password?: string }).password;
						if (fallbackHash) valid = await verifyPassword({ hash: fallbackHash, password });
					}
				} else {
					valid = await verifyPassword({ hash, password });
				}
				if (valid) email = safeUser.email ?? null;
			}
		} catch {
			valid = false;
		}

		if (!valid) {
			await ctx.runMutation(api.username.recordFailedAttempt, { username });
			return { ok: false as const, error: "Invalid username or password" };
		}

		await ctx.runMutation(api.username.clearSignInAttempts, { username });
		return { ok: true as const, email };
	},
});

export const findUsernameClaim = query({
	args: { username: v.string() },
	handler: async (ctx, { username }) => {
		return (
			(await ctx.db
				.query("usernameClaims")
				.withIndex("username", (q) => q.eq("username", username))
				.first()) ?? null
		);
	},
});

export const isUsernameTaken = query({
	args: { username: v.string(), userId: v.string() },
	handler: async (ctx, { username, userId }) => {
		const claim = await ctx.db
			.query("usernameClaims")
			.withIndex("username", (q) => q.eq("username", username))
			.first();
		if (claim) return claim.userId !== userId;

		const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "username", operator: "eq", value: username }],
			select: ["id"],
		});
		if (!user) return false;
		return docId(user) !== userId;
	},
});

export const claimUsername = mutation({
	args: { username: v.string(), userId: v.string() },
	handler: async (ctx, { username, userId }) => {
		const existing = await ctx.db
			.query("usernameClaims")
			.withIndex("username", (q) => q.eq("username", username))
			.first();
		if (existing) {
			if (existing.userId === userId) return { ok: true as const };
			return { ok: false as const };
		}

		const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: "user",
			where: [{ field: "username", operator: "eq", value: username }],
			select: ["id"],
		});
		const ownerId = docId(user);
		if (ownerId && ownerId !== userId) {
			return { ok: false as const };
		}

		try {
			await ctx.db.insert("usernameClaims", { username, userId });
			return { ok: true as const };
		} catch {
			return { ok: false as const };
		}
	},
});