import { convex } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export type SignInByUsernameResult =
	| { ok: true; email: string | null }
	| { ok: false; error: string };

export async function signInByUsername(
	username: string,
	password: string
): Promise<SignInByUsernameResult> {
	try {
		const result = await convex.action(api.username.signInByUsername, { username, password });
		return result as SignInByUsernameResult;
	} catch {
		return { ok: false, error: "Something went wrong. Please try again." };
	}
}