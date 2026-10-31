import { action } from "./_generated/server";
import { authComponent } from "./auth";

const STREAM_API_BASE = "https://chat.stream-io-api.com";

export type StreamServerAuth = {
	apiKey: string;
	secret: string;
	serverToken: string;
};

function streamHeaders(serverToken: string): Record<string, string> {
	return {
		Authorization: serverToken,
		"stream-auth-type": "jwt",
		"Content-Type": "application/json",
	};
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

export async function getStreamServerAuth(): Promise<StreamServerAuth> {
	const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
	const secret = process.env.STREAM_SECRET_KEY;
	if (!apiKey || !secret) {
		throw new Error("Stream API credentials are not configured");
	}

	return { apiKey, secret, serverToken: await signStreamToken(secret, { server: true }) };
}

export async function upsertStreamUser(
	auth: StreamServerAuth,
	user: { id: string; name: string; image?: string },
): Promise<void> {
	const response = await fetch(
		`${STREAM_API_BASE}/users?api_key=${encodeURIComponent(auth.apiKey)}`,
		{
			method: "POST",
			headers: streamHeaders(auth.serverToken),
			body: JSON.stringify({
				users: {
					[user.id]: {
						id: user.id,
						name: user.name,
						image: user.image,
						role: "user",
					},
				},
			}),
		},
	);

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Failed to sync Stream user (${response.status}): ${detail}`);
	}
}

export function slugifyChannelName(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);
}

function channelUrl(auth: StreamServerAuth, channelId: string): string {
	return `${STREAM_API_BASE}/channels/messaging/${encodeURIComponent(channelId)}?api_key=${encodeURIComponent(auth.apiKey)}`;
}

export async function createWorkspaceChannel(
	auth: StreamServerAuth,
	options: {
		workspaceId: string;
		userId: string;
		name: string;
		slug?: string;
		memberIds?: string[];
	},
): Promise<string> {
	const slug = options.slug ?? (slugifyChannelName(options.name) || "channel");
	const channelId = `${options.workspaceId}-${slug}`;
	const base = `${STREAM_API_BASE}/channels/messaging/${encodeURIComponent(channelId)}`;
	const query = `?api_key=${encodeURIComponent(auth.apiKey)}`;
	const url = `${base}${query}`;

	const created = await fetch(`${base}/query${query}`, {
		method: "POST",
		headers: streamHeaders(auth.serverToken),
		body: JSON.stringify({
			data: {
				name: options.name,
				workspaceId: options.workspaceId,
				created_by_id: options.userId,
				isChannel: true,
			},
			state: true,
			watch: false,
			presence: false,
		}),
	});
	if (!created.ok) {
		throw new Error(
			`Failed to create channel ${channelId} (${created.status}): ${await created.text()}`,
		);
	}

	const memberIds = Array.from(new Set([options.userId, ...(options.memberIds ?? [])]));
	const joined = await fetch(url, {
		method: "POST",
		headers: streamHeaders(auth.serverToken),
		body: JSON.stringify({ add_members: memberIds }),
	});
	if (!joined.ok) {
		throw new Error(
			`Failed to join channel ${channelId} (${joined.status}): ${await joined.text()}`,
		);
	}

	return channelId;
}

export async function addUserToChannel(
	auth: StreamServerAuth,
	channelId: string,
	userId: string,
): Promise<void> {
	const response = await fetch(channelUrl(auth, channelId), {
		method: "POST",
		headers: streamHeaders(auth.serverToken),
		body: JSON.stringify({ add_members: [userId] }),
	});
	if (response.status === 404) return;
	if (!response.ok) {
		throw new Error(
			`Failed to add ${userId} to ${channelId} (${response.status}): ${await response.text()}`,
		);
	}
}

export async function removeUserFromChannel(
	auth: StreamServerAuth,
	channelId: string,
	userId: string,
): Promise<void> {
	const response = await fetch(channelUrl(auth, channelId), {
		method: "POST",
		headers: streamHeaders(auth.serverToken),
		body: JSON.stringify({ remove_members: [userId] }),
	});
	if (response.status === 404) return;
	if (!response.ok) {
		throw new Error(
			`Failed to remove ${userId} from ${channelId} (${response.status}): ${await response.text()}`,
		);
	}
}

export async function deleteStreamChannel(
	auth: StreamServerAuth,
	channelId: string,
): Promise<void> {
	const response = await fetch(channelUrl(auth, channelId), {
		method: "DELETE",
		headers: streamHeaders(auth.serverToken),
		body: JSON.stringify({ hard_delete: true }),
	});
	if (response.status === 404) return;
	if (!response.ok) {
		throw new Error(
			`Failed to delete channel ${channelId} (${response.status}): ${await response.text()}`,
		);
	}
}

export async function updateStreamChannelName(
	auth: StreamServerAuth,
	channelId: string,
	name: string,
): Promise<void> {
	const response = await fetch(channelUrl(auth, channelId), {
		method: "PATCH",
		headers: streamHeaders(auth.serverToken),
		body: JSON.stringify({ set: { name } }),
	});
	if (response.status === 404) {
		throw new Error("This channel no longer exists");
	}
	if (!response.ok) {
		throw new Error(
			`Failed to rename channel ${channelId} (${response.status}): ${await response.text()}`,
		);
	}
}

export const syncStreamProfile = action({
	args: {},
	handler: async (ctx): Promise<{ ok: true }> => {
		const user = await authComponent.getAuthUser(ctx);
		const auth = await getStreamServerAuth();

		const userId = String(user._id);
		const name = user.name?.trim() || user.username || user.email || userId;
		const image = user.image ?? undefined;

		await upsertStreamUser(auth, { id: userId, name, image });

		return { ok: true };
	},
});

export const generateStreamToken = action({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		const auth = await getStreamServerAuth();

		const userId = String(user._id);
		const name = user.name?.trim() || user.username || user.email || userId;
		const image = user.image ?? undefined;

		await upsertStreamUser(auth, { id: userId, name, image });

		return {
			token: await signStreamToken(auth.secret, { user_id: userId }),
			apiKey: auth.apiKey,
			userId,
			name,
			image,
		};
	},
});
