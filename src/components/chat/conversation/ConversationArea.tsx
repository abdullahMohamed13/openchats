"use client";

import { useMemo, useState } from "react";
import {
  Channel,
  MessageComposer,
  MessageList,
  Window,
  WithComponents,
  useChatContext,
} from "stream-chat-react";
import { ConversationAvatar, ConversationAvatarStack } from "./ConversationAvatar";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationSearchDialog } from "./ConversationSearchDialog";
import { UserProfileDialog } from "../profile/UserProfileDialog";
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
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  const channel = useMemo(
    () => client.channel("messaging", channelId),
    [client, channelId]
  );

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <WithComponents
        overrides={{
          Avatar: ConversationAvatar,
          AvatarStack: ConversationAvatarStack,
        }}
      >
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
            <MessageList
              onUserClick={(_event, user) => setProfileUserId(user.id)}
            />
            <MessageComposer />
          </Window>
          {searchOpen && (
            <ConversationSearchDialog onClose={() => setSearchOpen(false)} />
          )}
          {profileUserId && (
            <UserProfileDialog
              userId={profileUserId}
              onClose={() => setProfileUserId(null)}
            />
          )}
        </Channel>
      </WithComponents>
    </main>
  );
}
