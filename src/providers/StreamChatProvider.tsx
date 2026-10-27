"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import "stream-chat-react/dist/css/index.css";

interface StreamChatProviderProps {
	children: ReactNode;
}

export default function StreamChatProvider({ children }: StreamChatProviderProps) {
	const { data: session, isPending } = authClient.useSession();
	const generateStreamToken = useAction(api.stream.generateStreamToken);
	const [client, setClient] = useState<StreamChat | null>(null);
	const [error, setError] = useState<string | null>(null);
	const connectingRef = useRef<Promise<void> | null>(null);
	const connectedUserIdRef = useRef<string | null>(null);

	const userId = session?.user?.id;
	const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

	useEffect(() => {
		if (isPending || !userId || !apiKey) return;

		let active = true;
		const instance = StreamChat.getInstance(apiKey);

		if (connectedUserIdRef.current && connectedUserIdRef.current !== userId) {
			connectedUserIdRef.current = null;
			connectingRef.current = null;
			instance.disconnectUser().catch(() => {});
			setClient(null);
		}

		if (!connectingRef.current) {
			connectingRef.current = (async () => {
				if (instance.userID === userId) return;
				const credentials = await generateStreamToken({});
				await instance.connectUser(
					{ id: credentials.userId, name: credentials.name, image: credentials.image },
					credentials.token,
				);
				connectedUserIdRef.current = credentials.userId;
			})();
		}

		connectingRef.current
			.then(() => {
				if (active) setClient(instance);
			})
			.catch((err: unknown) => {
				connectingRef.current = null;
				if (active) {
					setError(err instanceof Error ? err.message : "Failed to connect to chat");
				}
			});

		return () => {
			active = false;
		};
	}, [isPending, userId, apiKey, generateStreamToken]);

	if (!apiKey) {
		return (
			<div className="flex h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
				Stream API key is not configured
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
				{error}
			</div>
		);
	}

	if (!client) {
		return (
			<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
				Connecting to chat…
			</div>
		);
	}

	return (
		<Chat client={client} theme="str-chat__theme-dark">
			{children}
		</Chat>
	);
}
