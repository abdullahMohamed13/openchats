"use client";

import { useMemo } from "react";
import { Channel, MessageComposer, MessageList, Window, useChatContext } from "stream-chat-react";
import { ConversationHeader } from "./conversation-header";

interface ConversationAreaProps {
  channelId: string;
  title: string;
  subtitle: string;
  unreadCount?: number;
  showMenuButton?: boolean;
  onToggleNav?: () => void;
}

export function ConversationArea({
  channelId,
  title,
  subtitle,
  unreadCount,
  showMenuButton,
  onToggleNav,
}: ConversationAreaProps) {
  const { client } = useChatContext();

  const channel = useMemo(
    () => client.channel("messaging", channelId),
    [client, channelId]
  );

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <Channel channel={channel}>
        <Window>
          <ConversationHeader
            title={title}
            subtitle={subtitle}
            unreadCount={unreadCount}
            showMenuButton={showMenuButton}
            onToggleNav={onToggleNav}
          />
          <MessageList />
          <MessageComposer />
        </Window>
      </Channel>
    </main>
  );
}
