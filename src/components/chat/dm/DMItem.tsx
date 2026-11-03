import Image from "next/image";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "../UnreadBadge";
import type { UserStatus } from "@/types/chat";

interface DMItemProps {
	name: string;
	avatar: string;
	status: UserStatus;
	unreadCount: number;
	isActive: boolean;
	onSelect: () => void;
}

export function DMItem({ name, avatar, status, unreadCount, isActive, onSelect }: DMItemProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-current={isActive ? "true" : undefined}
			title={name}
			className={cn(
				"group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
				isActive
					? "bg-primary/20 font-medium text-foreground"
					: "text-muted-foreground hover:bg-muted hover:text-foreground"
			)}
		>
			<span className="relative shrink-0">
				<Image
					src={avatar}
					alt=""
					width={22}
					height={22}
					className="size-[22px] rounded-full object-cover"
				/>
				<span
					className={cn(
						"absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-background",
						status === "online" && "bg-success",
						status === "away" && "bg-warning",
						status === "offline" && "bg-muted-foreground/50"
					)}
					aria-hidden
				/>
			</span>
			<span className="min-w-0 flex-1 truncate">{name}</span>
			<UnreadBadge count={isActive ? 0 : unreadCount} />
		</button>
	);
}
