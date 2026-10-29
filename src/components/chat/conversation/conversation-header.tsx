import { Menu, Search, Bell, Settings2 } from "pixelarticons/react";
import { UnreadBadge } from "../unread-badge";
import { ConversationHeaderProps } from "@/types/conversation";
import { IconButton } from "./IconButton";

export function ConversationHeader({
  title,
  unreadCount,
  showMenuButton,
  onToggleNav,
  onOpenChannelSettings,
  onOpenSearch,
  onOpenNotifications,
  notificationCount = 0,
}: ConversationHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      {showMenuButton && (
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleNav}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Menu width={20} height={20} />
        </button>
      )}

      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        {unreadCount ? <UnreadBadge count={unreadCount} /> : null}
      </div>

      {/*<p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">{subtitle}</p>*/}

      <div className="ml-auto flex items-center gap-1">
        {onOpenChannelSettings && (
          <IconButton label="Channel settings" onClick={onOpenChannelSettings}>
            <Settings2 width={18} height={18} />
          </IconButton>
        )}
        <IconButton label="Search this conversation" onClick={onOpenSearch}>
          <Search width={18} height={18} />
        </IconButton>
        <IconButton label="Notifications" onClick={onOpenNotifications}>
          <Bell width={18} height={18} />
          {notificationCount > 0 && (
            <span
              className="absolute right-1 top-1 size-1.5 rounded-full bg-danger"
              aria-hidden
            />
          )}
        </IconButton>
      </div>
    </header>
  );
}