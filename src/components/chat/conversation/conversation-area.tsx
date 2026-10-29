"use client";

import { useMemo, useState } from "react";
import { Channel, MessageComposer, MessageList, Window, useChatContext } from "stream-chat-react";
import { ConversationHeader } from "./conversation-header";
import { ConversationSearchDialog } from "./conversation-search-dialog";
import { ConversationAreaProps } from "@/types/conversation";

export function ConversationArea({
  channelId,
  title,
  subtitle,
  unreadCount,
  showMenuButton,
  onToggleNav,
  onOpenChannelSettings,
  onOpenNotifications,
  notificationCount,
}: ConversationAreaProps) {
  const { client } = useChatContext();
  const [searchOpen, setSearchOpen] = useState(false);

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
            onOpenChannelSettings={onOpenChannelSettings}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenNotifications={onOpenNotifications}
            notificationCount={notificationCount}
          />
          <MessageList />
          <MessageComposer />
        </Window>
        {searchOpen && (
          <ConversationSearchDialog onClose={() => setSearchOpen(false)} />
        )}
      </Channel>
    </main>
  );
}
