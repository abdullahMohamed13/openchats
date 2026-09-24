"use client";

import { useMemo, useState } from "react";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import type { MockMessage, ConversationKey } from "@/data/dashboard/messages";
import type { MockUser } from "@/data/dashboard/users";

interface ConversationAreaProps {
  conversationKey: ConversationKey;
  title: string;
  subtitle: string;
  unreadCount?: number;
  messages: MockMessage[];
  users: MockUser[];
  currentUser: MockUser;
  showMenuButton?: boolean;
  onToggleNav?: () => void;
}

export function ConversationArea({
  conversationKey,
  title,
  subtitle,
  unreadCount,
  messages,
  users,
  currentUser,
  showMenuButton,
  onToggleNav,
}: ConversationAreaProps) {
  const [draftMessages, setDraftMessages] = useState<MockMessage[]>([]);

  const allMessages = useMemo<MockMessage[]>(
    () => [...messages, ...draftMessages],
    [messages, draftMessages]
  );

  const handleSend = (content: string) => {
    const message: MockMessage = {
      id: `${conversationKey}-draft-${draftMessages.length}`,
      conversationId: conversationKey,
      userId: currentUser.id,
      content,
      time: "Now",
    };
    setDraftMessages((drafts) => [...drafts, message]);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <ConversationHeader
        title={title}
        subtitle={subtitle}
        unreadCount={unreadCount}
        showMenuButton={showMenuButton}
        onToggleNav={onToggleNav}
      />
      <MessageList messages={allMessages} users={users} currentUser={currentUser} />
      <MessageComposer placeholder={`Message ${title.startsWith("#") ? title.slice(2) : title}`} onSend={handleSend} />
    </main>
  );
}