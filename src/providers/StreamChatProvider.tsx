"use client";

import { useEffect, useState, type ReactNode } from "react";
import { StreamChat } from "stream-chat";
import { Chat, WithComponents } from "stream-chat-react";
import { Plus } from "pixelarticons/react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { StreamNotifications } from "@/components/chat/notifications/StreamNotifications";
import { streamIcons } from "@/data/stream-icons";
import "stream-chat-react/dist/css/index.css";

function AttachmentSelectorPlus() {
	return (
		<Plus className="str-chat__icon str-chat__attachment-selector__menu-button__icon" />
	);
}

export default function StreamChatProvider({ children }: {children: ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const generateStreamToken = useAction(api.stream.generateStreamToken);
	const [client, setClient] = useState<StreamChat | null>(null);
	const [error, setError] = useState<string | null>(null);

	const userId = session?.user?.id;
	const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

	// The Stream client is a singleton, so it must be disconnected when the chat
	// UI goes away. Otherwise the previous account stays connected (and online).
	useEffect(() => {
		if (!apiKey) return;

		const instance = StreamChat.getInstance(apiKey);
		return () => {
			if (!instance.userID) return;
			void instance.disconnectUser().catch(() => {});
		};
	}, [apiKey]);

	useEffect(() => {
		if (isPending || !apiKey) return;

		const instance = StreamChat.getInstance(apiKey);
		let active = true;

		const connect = async () => {
			if (!userId) {
				// The session ended while the provider was still mounted.
				if (instance.userID) await instance.disconnectUser().catch(() => {});
				if (active) setClient(null);
				return;
			}

			if (instance.userID === userId) {
				if (active) {
					setError(null);
					setClient(instance);
				}
				return;
			}

			// A previous account may still own the singleton after a sign-out or
			// an account switch. connectUser() throws unless it is disconnected.
			if (instance.userID) {
				await instance.disconnectUser().catch(() => {});
			}

			if (!active) return;

			const credentials = await generateStreamToken({});
			if (!active) return;

			await instance.connectUser(
				{ id: credentials.userId, name: credentials.name, image: credentials.image },
				credentials.token,
			);

			if (active) {
				setError(null);
				setClient(instance);
			}
		};

		connect().catch((err: unknown) => {
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
		<Chat
			client={client}
			theme="str-chat__theme-dark"
			notificationDisplayFilter={() => false}
		>
			<WithComponents
				overrides={{
					icons: streamIcons,
					AttachmentSelectorInitiationButtonContents: AttachmentSelectorPlus,
				}}
			>
				<StreamNotifications />
				{children}
			</WithComponents>
		</Chat>
	);
}
