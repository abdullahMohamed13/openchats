import { action } from "./_generated/server";
import { authComponent } from "./auth";

const STREAM_API_BASE = "https://chat.stream-io-api.com";

const DEFAULT_CHANNELS: { id: string; name: string }[] = [
	{ id: "general", name: "general" },
];

function streamHeaders(serverToken: string): Record<string, string> {
	return {
		Authorization: serverToken,
		"stream-auth-type": "jwt",
		"Content-Type": "application/json",
	};
}

async function ensureDefaultChannels(apiKey: string, serverToken: string, userId: string) {
	const query = `?api_key=${encodeURIComponent(apiKey)}`;
	for (const channel of DEFAULT_CHANNELS) {
		const url = `${STREAM_API_BASE}/channels/messaging/${encodeURIComponent(channel.id)}`;
		const created = await fetch(`${url}/query${query}`, {
			method: "POST",
			headers: streamHeaders(serverToken),
			body: JSON.stringify({
				data: { name: channel.name, created_by_id: userId, isChannel: true },
				state: true,
				watch: false,
				presence: false,
			}),
		});
		if (!created.ok) {
			throw new Error(`Failed to seed channel ${channel.id} (${created.status}): ${await created.text()}`);
		}

		const joined = await fetch(`${url}${query}`, {
			method: "POST",
			headers: streamHeaders(serverToken),
			body: JSON.stringify({ add_members: [userId], data: { name: channel.name, isChannel: true } }),
		});
		if (!joined.ok) {
			throw new Error(`Failed to join channel ${channel.id} (${joined.status}): ${await joined.text()}`);
		}
	}
}

function bytesToBase64url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64url(value: string): string {
	return bytesToBase64url(new TextEncoder().encode(value));
}

export async function signStreamToken(
	secret: string,
	payload: Record<string, unknown>,
): Promise<string> {
	const encodedHeader = stringToBase64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const encodedPayload = stringToBase64url(JSON.stringify(payload));
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
	);
	return `${encodedHeader}.${encodedPayload}.${bytesToBase64url(new Uint8Array(signature))}`;
}

export const generateStreamToken = action({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);

		const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
		const secret = process.env.STREAM_SECRET_KEY;
		if (!apiKey || !secret) {
			throw new Error("Stream API credentials are not configured");
		}

		const userId = String(user._id);
		const name = user.name?.trim() || user.username || user.email || userId;
		const image = user.image ?? undefined;

		const serverToken = await signStreamToken(secret, { server: true });
		const response = await fetch(`${STREAM_API_BASE}/users?api_key=${encodeURIComponent(apiKey)}`, {
			method: "POST",
			headers: streamHeaders(serverToken),
			body: JSON.stringify({
				users: { [userId]: { id: userId, name, image, role: "user" } },
			}),
		});

		if (!response.ok) {
			const detail = await response.text();
			throw new Error(`Failed to sync Stream user (${response.status}): ${detail}`);
		}

		await ensureDefaultChannels(apiKey, serverToken, userId);

		return {
			token: await signStreamToken(secret, { user_id: userId }),
			apiKey,
			userId,
			name,
			image,
		};
	},
});
