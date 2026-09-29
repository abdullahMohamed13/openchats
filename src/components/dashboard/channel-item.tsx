import { Hash } from "pixelarticons/react";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "./unread-badge";
import type { MockChannel } from "@/data/dashboard/channels";

interface ChannelItemProps {
  channel: MockChannel;
  isActive: boolean;
  onSelect: () => void;
}

export function ChannelItem({ channel, isActive, onSelect }: ChannelItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      title={`# ${channel.name}`}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        isActive
          ? "bg-primary/20 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Hash width={16} height={16} className="shrink-0 opacity-80" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{channel.name}</span>
      <UnreadBadge count={isActive ? 0 : channel.unreadCount} />
    </button>
  );
}