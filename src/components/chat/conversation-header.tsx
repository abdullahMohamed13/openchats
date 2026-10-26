"use client";

import { Menu, Search, Bell } from "pixelarticons/react";
import { UnreadBadge } from "./unread-badge";

interface ConversationHeaderProps {
  title: string;
  subtitle: string;
  unreadCount?: number;
  showMenuButton?: boolean;
  onToggleNav?: () => void;
}

export function ConversationHeader({
  title,
  subtitle,
  unreadCount,
  showMenuButton,
  onToggleNav,
}: ConversationHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      {showMenuButton && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onToggleNav}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu width={20} height={20} />
        </button>
      )}

      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        {unreadCount ? <UnreadBadge count={unreadCount} /> : null}
      </div>

      <p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">{subtitle}</p>

      <div className="ml-auto flex items-center gap-1">
        <IconButton label="Search this conversation">
          <Search width={18} height={18} />
        </IconButton>
        <IconButton label="Notifications">
          <Bell width={18} height={18} />
        </IconButton>
      </div>
    </header>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}