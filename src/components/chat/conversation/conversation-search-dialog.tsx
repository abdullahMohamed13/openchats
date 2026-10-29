"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { MessageResponse } from "stream-chat";
import {
	useChannelActionContext,
	useChannelStateContext,
	useChatContext,
} from "stream-chat-react";
import { Input } from "@/components/ui/8bit/input";
import { getErrorMessage } from "@/lib/error-message";
import { HighlightedText } from "./highlighted-text";
import { ConversationSearchDialogProps } from "@/types/conversation";

function messageText(message: MessageResponse): string {
	if (message.text?.trim()) return message.text;
	if (message.attachments?.length) return "Attachment";
	return "Message";
}

export function ConversationSearchDialog({
	onClose,
}: ConversationSearchDialogProps) {
	const { client } = useChatContext();
	const { channel } = useChannelStateContext();
	const { jumpToMessage } = useChannelActionContext();

	const [query, setQuery] = useState("");
	const [results, setResults] = useState<MessageResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const [jumpingId, setJumpingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const busy = jumpingId !== null;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busy, onClose]);

	useEffect(() => {
		const term = query.trim();
		if (!term) return;

		let active = true;
		const timer = window.setTimeout(() => {
			void (async () => {
				setLoading(true);
				setError(null);
				try {
					const response = await client.search(
						{ type: "messaging", cid: channel.cid },
						{ text: { $q: term } },
						{ limit: 20 },
					);
					if (!active) return;
					setResults(response.results.map((result) => result.message));
					setSearched(true);
				} catch (cause) {
					if (active) {
						setError(getErrorMessage(cause, "Could not search messages."));
					}
				} finally {
					if (active) setLoading(false);
				}
			})();
		}, 300);

		return () => {
			active = false;
			window.clearTimeout(timer);
		};
	}, [client, channel.cid, query]);

	const handleQueryChange = (value: string) => {
		setQuery(value);
		setError(null);
		if (!value.trim()) {
			setResults([]);
			setSearched(false);
			setLoading(false);
		}
	};

	const handleJump = async (message: MessageResponse) => {
		setJumpingId(message.id);
		setError(null);
		try {
			await jumpToMessage(message.id, 25, 2000);
			onClose();
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not open that message."));
			setJumpingId(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-16 sm:py-24">
			<button
				type="button"
				aria-label="Close message search"
				onClick={busy ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="conversation-search-title"
				initial={{ opacity: 0, y: -12, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.16, ease: "easeOut" }}
				className="relative z-10 flex max-h-[70vh] w-full max-w-lg flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border p-4">
					<h2
						id="conversation-search-title"
						className="font-press-start text-xs uppercase text-foreground"
					>
						Search this conversation
					</h2>
					<Input
						value={query}
						onChange={(event) => handleQueryChange(event.target.value)}
						placeholder="Search messages"
						aria-label="Search messages"
						autoComplete="off"
						autoFocus
						disabled={busy}
						className="mt-3 h-11"
					/>
				</header>

				<div className="min-h-28 flex-1 overflow-y-auto p-4">
					{!query.trim() ? (
						<p className="text-sm text-muted-foreground">
							Type a word or phrase to find messages in this conversation.
						</p>
					) : loading ? (
						<p className="text-sm text-muted-foreground">Searching…</p>
					) : results.length === 0 && searched ? (
						<p className="text-sm text-muted-foreground">
							No messages found for “{query.trim()}”.
						</p>
					) : (
						<ul className="flex flex-col divide-y divide-border border-y border-border">
							{results.map((message) => (
								<li key={message.id}>
									<button
										type="button"
										onClick={() => void handleJump(message)}
										disabled={busy}
										className="flex w-full flex-col gap-1 py-2.5 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
									>
										<span className="flex items-center justify-between gap-3">
											<span className="truncate text-xs font-semibold text-foreground">
												{message.user?.name || message.user?.id || "Unknown"}
											</span>
											<span className="shrink-0 text-[10px] text-muted-foreground">
												{message.created_at
													? new Date(message.created_at).toLocaleString()
													: ""}
											</span>
										</span>
										<span className="line-clamp-2 text-sm text-muted-foreground">
											<HighlightedText
												text={messageText(message)}
												term={query}
											/>
										</span>
										{jumpingId === message.id && (
											<span className="text-[10px] uppercase tracking-wide text-primary">
												Opening…
											</span>
										)}
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
			</motion.div>
		</div>
	);
}
