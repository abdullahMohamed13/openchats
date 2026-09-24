import { Message } from "./message";
import { UNREAD_DIVIDER_ID, type MockMessage } from "@/data/dashboard/messages";
import type { MockUser } from "@/data/dashboard/users";

interface MessageListProps {
  messages: MockMessage[];
  users: MockUser[];
  currentUser: MockUser;
}

function userForMessage(message: MockMessage, users: MockUser[], currentUser: MockUser): MockUser {
  if (message.userId === currentUser.id || message.userId === "you") return currentUser;
  return users.find((user) => user.id === message.userId) ?? currentUser;
}

export function MessageList({ messages, users, currentUser }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground">Say something to get the conversation started.</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-1 flex-col overflow-y-auto py-3" key={UNREAD_DIVIDER_ID}>
      {messages.map((message, index) => {
        const showDivider = message.isNewUnread === true;
        const previous = index > 0 ? messages[index - 1] : undefined;
        const isGrouped =
          previous != null && previous.userId === message.userId && previous.isNewUnread !== true;

        return (
          <li key={message.id}>
            {showDivider && (
              <div className="flex items-center gap-3 px-4 pt-4" role="separator" aria-label="New messages">
                <span className="h-px flex-1 bg-accent/60" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">New messages</span>
                <span className="h-px flex-1 bg-accent/60" />
              </div>
            )}
            <Message message={message} user={userForMessage(message, users, currentUser)} isGrouped={isGrouped} />
          </li>
        );
      })}
    </ol>
  );
}