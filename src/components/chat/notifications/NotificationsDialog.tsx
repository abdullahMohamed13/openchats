"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/8bit/button";
import { getErrorMessage } from "@/lib/error-message";
import type { ChannelSummary, DirectMessageSummary } from "@/types/chat";

interface NotificationsDialogProps {
	channels: ChannelSummary[];
	dms: DirectMessageSummary[];
	onSelect: (id: string) => void;
	onMarkAllRead: () => void | Promise<void>;
	onClose: () => void;
}

interface NotificationItem {
	id: string;
	name: string;
	kind: "channel" | "dm";
	unreadCount: number;
}

export function NotificationsDialog({
	channels,
	dms,
	onSelect,
	onMarkAllRead,
	onClose,
}: NotificationsDialogProps) {
	const [marking, setMarking] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !marking) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [marking, onClose]);

	const items = useMemo<NotificationItem[]>(() => {
		const unreadChannels: NotificationItem[] = channels
			.filter((channel) => channel.unreadCount > 0)
			.map((channel) => ({
				id: channel.id,
				name: channel.name,
				kind: "channel",
				unreadCount: channel.unreadCount,
			}));
		const unreadDms: NotificationItem[] = dms
			.filter((dm) => dm.unreadCount > 0)
			.map((dm) => ({
				id: dm.id,
				name: dm.name,
				kind: "dm",
				unreadCount: dm.unreadCount,
			}));
		return [...unreadChannels, ...unreadDms].sort(
			(a, b) => b.unreadCount - a.unreadCount,
		);
	}, [channels, dms]);

	const totalUnread = items.reduce((total, item) => total + item.unreadCount, 0);

	const handleMarkAllRead = async () => {
		setMarking(true);
		setError(null);
		try {
			await onMarkAllRead();
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not mark notifications as read."));
		} finally {
			setMarking(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16">
			<button
				type="button"
				aria-label="Close notifications"
				onClick={marking ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[1px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="notifications-title"
				initial={{ opacity: 0, y: -10, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.16, ease: "easeOut" }}
				className="relative z-10 flex max-h-[70vh] w-full max-w-sm flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="flex items-start justify-between gap-3 border-b border-border p-4">
					<div>
						<h2
							id="notifications-title"
							className="font-press-start text-xs uppercase text-foreground"
						>
							Notifications
						</h2>
						<p className="mt-2 text-xs text-muted-foreground">
							{totalUnread > 0
								? `${totalUnread} unread ${totalUnread === 1 ? "message" : "messages"}`
								: "You're all caught up."}
						</p>
					</div>
				</header>

				<div className="flex-1 overflow-y-auto p-4">
					{items.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No unread conversations right now.
						</p>
					) : (
						<ul className="flex flex-col divide-y divide-border border-y border-border">
							{items.map((item) => (
								<li key={`${item.kind}-${item.id}`}>
									<button
										type="button"
										onClick={() => {
											onSelect(item.id);
											onClose();
										}}
										disabled={marking}
										className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
									>
										<span className="flex size-8 shrink-0 items-center justify-center border border-border font-press-start text-[10px] text-muted-foreground">
											{item.kind === "channel" ? "#" : "@"}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm text-foreground">
												{item.name}
											</span>
											<span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
												{item.kind === "channel"
													? "Channel"
													: "Direct message"}
											</span>
										</span>
										<span className="shrink-0 border border-primary px-2 py-0.5 text-[10px] font-semibold text-primary">
											{item.unreadCount}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}

					{error && (
						<p role="alert" className="mt-4 text-xs text-danger">
							{error}
						</p>
					)}
				</div>

				<footer className="flex items-center justify-between gap-3 border-t border-border p-4">
					<Button
						type="button"
						onClick={() => void handleMarkAllRead()}
						disabled={marking || items.length === 0}
						size="sm"
						className="px-3 py-2 text-[10px] uppercase"
					>
						{marking ? "Marking…" : "Mark all read"}
					</Button>
					<Button
						type="button"
						onClick={onClose}
						disabled={marking}
						variant="outline"
						size="sm"
						className="px-3 py-2 text-[10px] uppercase"
					>
						Close
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
