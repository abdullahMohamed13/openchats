import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MockMessage } from "@/data/dashboard/messages";
import type { MockUser } from "@/data/dashboard/users";

interface MessageProps {
  message: MockMessage;
  user: MockUser;
  isGrouped?: boolean;
}

export function Message({ message, user, isGrouped }: MessageProps) {
  return (
    <div className={cn("group flex gap-3 px-4", isGrouped ? "py-0.5" : "pt-4")}>
      {isGrouped ? (
        <span className="mt-4 w-9 shrink-0" aria-hidden />
      ) : (
        <Image
          src={user.avatar}
          alt={user.name}
          width={36}
          height={36}
          className="mt-0.5 size-9 shrink-0 rounded-full object-cover"
        />
      )}

      <div className="min-w-0 flex-1 rounded-lg px-2 py-1 transition-colors hover:bg-muted/30">
        {!isGrouped && (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.title}</span>
            <time className="text-xs text-muted-foreground/70">{message.time}</time>
          </p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">{message.content}</p>

        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                title={`${reaction.by.join(", ")}`}
                className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary"
              >
                <span aria-hidden>{reaction.emoji}</span>
                <span>{reaction.by.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}