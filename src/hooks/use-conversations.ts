"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Event, StreamChat } from "stream-chat";
import { DEFAULT_AVATAR, type ChannelSummary, type DirectMessageSummary } from "@/types/chat";
import { Conversations } from "@/types/conversation";

const EMPTY: Conversations = { channels: [], dms: [], loading: true };

export function useConversations(
	client: StreamChat | null,
	workspaceId: string,
): Conversations & { refresh: () => Promise<void> } {
	const [state, setState] = useState<Conversations>(EMPTY);
	const refreshRef = useRef<() => Promise<void>>(async () => {});

	useEffect(() => {
		if (!client?.userID) return;
		const userId = client.userID;
		let active = true;

		const load = async () => {
			const result = await client.queryChannels(
				{ type: "messaging", members: { $in: [userId] } },
				[{ last_message_at: -1 }],
				{ watch: true, presence: true, state: true },
			);
			if (!active) return;

			const channels: ChannelSummary[] = [];
			const dms: DirectMessageSummary[] = [];

			for (const channel of result) {
				const id = channel.id;
				if (!id) continue;

				const data = channel.data as
					| { name?: unknown; isChannel?: unknown; workspaceId?: unknown }
					| undefined;
				const name = typeof data?.name === "string" ? data.name : "";
				const channelWorkspaceId =
					typeof data?.workspaceId === "string" ? data.workspaceId : null;
				const members = Object.values(channel.state.members ?? {});
				const unreadCount = channel.countUnread();

				if (channelWorkspaceId === workspaceId) {
					channels.push({ id, name: name || id, unreadCount });
					continue;
				}

				if (channelWorkspaceId) continue;

				if (data?.isChannel === true || name.length > 0) continue;

				const other = members.find((member) => member.user_id !== userId)?.user;
				dms.push({
					id,
					name: other?.name ?? other?.id ?? "Unknown",
					avatar: other?.image ?? DEFAULT_AVATAR,
					status: other?.online ? "online" : "offline",
					unreadCount,
				});
			}

			setState({ channels, dms, loading: false });
		};

		const refresh = async () => {
			try {
				await load();
			} catch {
				if (active) setState((current) => ({ ...current, loading: false }));
			}
		};

		refreshRef.current = refresh;

		const removeChannel = (event: Event) => {
			if (!event.cid) return;
			const channelId = event.cid.split(":").slice(1).join(":");
			setState((current) => ({
				...current,
				channels: current.channels.filter((channel) => channel.id !== channelId),
				dms: current.dms.filter((dm) => dm.id !== channelId),
			}));
		};

		refresh();

		client.on("channel.created", refresh);
		client.on("channel.updated", refresh);
		client.on("channel.deleted", removeChannel);
		client.on("channel.deleted", refresh);
		client.on("notification.added_to_channel", refresh);
		client.on("notification.removed_from_channel", removeChannel);
		client.on("notification.removed_from_channel", refresh);
		client.on("notification.message_new", refresh);

		return () => {
			active = false;
			if (refreshRef.current === refresh) {
				refreshRef.current = async () => {};
			}
			client.off("channel.created", refresh);
			client.off("channel.updated", refresh);
			client.off("channel.deleted", removeChannel);
			client.off("channel.deleted", refresh);
			client.off("notification.added_to_channel", refresh);
			client.off("notification.removed_from_channel", removeChannel);
			client.off("notification.removed_from_channel", refresh);
			client.off("notification.message_new", refresh);
		};
	}, [client, workspaceId]);

	const refresh = useCallback(() => refreshRef.current(), []);

	return { ...state, refresh };
}
