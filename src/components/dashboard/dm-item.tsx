import Image from "next/image";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "./unread-badge";
import type { MockDM } from "@/data/dashboard/dms";
import type { MockUser } from "@/data/dashboard/users";

interface DMItemProps {
  dm: MockDM;
  user: MockUser;
  isActive: boolean;
  onSelect: () => void;
}

export function DMItem({ dm, user, isActive, onSelect }: DMItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      title={user.name}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        isActive
          ? "bg-primary/20 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="relative shrink-0">
        <Image
          src={user.avatar}
          alt=""
          width={22}
          height={22}
          className="size-[22px] rounded-full object-cover"
        />
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-background",
            user.status === "online" && "bg-success",
            user.status === "away" && "bg-warning",
            user.status === "offline" && "bg-muted-foreground/50"
          )}
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1 truncate">{user.name}</span>
      <UnreadBadge count={isActive ? 0 : dm.unreadCount} />
    </button>
  );
}