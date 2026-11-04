"use client";

import { useEffect, useState } from "react";
import {
	Avatar,
	Badge,
	useChannelStateContext,
	useChatContext,
	type AvatarStackProps,
	type ChannelAvatarProps,
} from "stream-chat-react";
import { cn } from "@/lib/utils";

/**
 * Stream's avatar does not receive presence, so read the member online state
 * from the channel and keep it fresh with presence events.
 */
export function ConversationAvatar(props: ChannelAvatarProps) {
	const { client } = useChatContext();
	const { channel } = useChannelStateContext();
	const userId = typeof props.id === "string" ? props.id : undefined;
	const [isOnline, setIsOnline] = useState(false);

	useEffect(() => {
		if (!userId) return;

		const update = () => {
			const member = channel.state.members[userId];
			setIsOnline(Boolean(member?.user?.online));
		};

		update();
		client.on("user.presence.changed", update);
		client.on("member.updated", update);
		client.on("connection.changed", update);
		return () => {
			client.off("user.presence.changed", update);
			client.off("member.updated", update);
			client.off("connection.changed", update);
		};
	}, [client, channel, userId]);

	return (
		<Avatar
			{...props}
			isOnline={userId ? isOnline : props.isOnline}
		/>
	);
}

/**
 * Stream's AvatarStack drops the user id, so the typing indicator's avatars
 * could not resolve presence. Keep the id when rendering the stacked avatars.
 */
export function ConversationAvatarStack({
	badgeSize,
	capLimit = 3,
	component: Component = "div",
	displayInfo = [],
	size,
}: AvatarStackProps) {
	if (!displayInfo.length) return null;

	const visible = displayInfo.slice(0, capLimit);
	const overflowCount = displayInfo.length - visible.length;

	return (
		<Component
			className={cn(
				"str-chat__avatar-stack",
				typeof size === "string" && `str-chat__avatar-stack--size-${size}`,
			)}
			data-testid="avatar-stack"
		>
			{visible.map((info, index) => (
				<ConversationAvatar
					key={info.id ?? `${info.userName}-${info.imageUrl}-${index}`}
					id={info.id}
					imageUrl={info.imageUrl}
					userName={info.userName}
					size={size}
				/>
			))}
			{overflowCount > 0 && (
				<Badge
					className="str-chat__avatar-stack__count-badge"
					data-testid="avatar-stack-count-badge"
					size={badgeSize ?? size}
					variant="counter"
				>
					+{overflowCount}
				</Badge>
			)}
		</Component>
	);
}
