import { convex } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export type ClaimUsernameResult = { ok: true } | { ok: false; reason: "taken" | "unavailable" };

export async function claimUsername(username: string, userId: string): Promise<ClaimUsernameResult> {
	try {
		const result = await convex.mutation(api.username.claimUsername, { username, userId });
		return result.ok ? { ok: true } : { ok: false, reason: "taken" };
	} catch {
		return { ok: false, reason: "unavailable" };
	}
}
