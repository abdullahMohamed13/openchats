"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import type { ChannelFilters } from "stream-chat";
import { useChatContext } from "stream-chat-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { getErrorMessage } from "@/lib/error-message";
import { DEFAULT_AVATAR, type WorkspaceMember } from "@/types/chat";

interface NewDirectMessageDialogProps {
	workspaceId: Id<"workspaces">;
	onClose: () => void;
	onCreated: (channelId: string) => void | Promise<void>;
}

function roleLabel(role: WorkspaceMember["role"]): string {
	if (role === "owner") return "Owner";
	if (role === "admin") return "Admin";
	return "Member";
}

export function NewDirectMessageDialog({
	workspaceId,
	onClose,
	onCreated,
}: NewDirectMessageDialogProps) {
	const { client } = useChatContext();
	const members = useQuery(api.workspaces.listMembers, { workspaceId });
	const [query, setQuery] = useState("");
	const [creatingId, setCreatingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const currentUserId = client.userID;
	const creating = creatingId !== null;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !creating) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [creating, onClose]);

	const filteredMembers = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		return (members ?? []).filter((member) => {
			if (member.userId === currentUserId) return false;
			if (!normalized) return true;
			return (
				member.name.toLowerCase().includes(normalized) ||
				(member.username ?? "").toLowerCase().includes(normalized) ||
				(member.email ?? "").toLowerCase().includes(normalized)
			);
		});
	}, [members, query, currentUserId]);

	const handleSelect = async (member: WorkspaceMember) => {
		if (!currentUserId || creating) return;

		setCreatingId(member.userId);
		setError(null);
		try {
			const filter = {
				type: "messaging",
				distinct: true,
				$and: [
					{ members: { $in: [currentUserId] } },
					{ members: { $in: [member.userId] } },
				],
			} as ChannelFilters;
			const existing = await client.queryChannels(
				filter,
				[{ last_message_at: -1 }],
				{ limit: 10, watch: false, state: true },
			);

			let channelId = existing.find(
				(channel) =>
					Object.keys(channel.state.members ?? {}).length === 2,
			)?.id;
			if (!channelId) {
				const channel = client.channel("messaging", {
					members: [currentUserId, member.userId],
				});
				await channel.watch();
				channelId = channel.id;
			}

			if (!channelId) throw new Error("Could not open the conversation.");
			await onCreated(channelId);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not open the conversation."));
		} finally {
			setCreatingId(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close new direct message dialog"
				onClick={creating ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="new-direct-message-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border p-5">
					<h2
						id="new-direct-message-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						New direct message
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Choose someone from this workspace to start a private conversation.
					</p>
				</header>

				<div className="flex-1 overflow-y-auto p-5">
					<label
						htmlFor="dm-member-search"
						className="text-xs uppercase tracking-wide text-muted-foreground"
					>
						Search members
					</label>
					<Input
						id="dm-member-search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search by name or username"
						autoComplete="off"
						autoFocus
						disabled={creating}
						className="mt-2 h-11"
					/>

					{members === undefined ? (
						<p className="mt-4 text-sm text-muted-foreground">
							Loading members…
						</p>
					) : filteredMembers.length === 0 ? (
						<p className="mt-4 text-sm text-muted-foreground">
							{query.trim()
								? `No members match “${query.trim()}”.`
								: "There is no one else in this workspace yet."}
						</p>
					) : (
						<ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
							{filteredMembers.map((member) => (
								<li key={member.userId}>
									<button
										type="button"
										onClick={() => void handleSelect(member)}
										disabled={creating}
										className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
									>
										<Image
											src={member.image ?? DEFAULT_AVATAR}
											alt=""
											width={32}
											height={32}
											className="size-8 rounded-full border border-border object-cover"
										/>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm text-foreground">
												{member.name}
											</span>
											<span className="block truncate text-xs text-muted-foreground">
												{member.username ? `@${member.username}` : member.email}
											</span>
										</span>
										<span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
											{creatingId === member.userId
												? "Opening…"
												: roleLabel(member.role)}
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

				<footer className="flex justify-end border-t border-border p-4">
					<Button
						type="button"
						onClick={onClose}
						disabled={creating}
						variant="outline"
						className="px-4 py-2 text-xs uppercase"
					>
						Cancel
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
