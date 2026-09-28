import { convex } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export type UsernameAvailability = "available" | "taken" | "unavailable";

export async function checkUsername(
	username: string,
	userId: string
): Promise<UsernameAvailability> {
	try {
		const taken = await convex.query(api.username.isUsernameTaken, { username, userId });
		return taken ? "taken" : "available";
	} catch {
		return "unavailable";
	}
}
