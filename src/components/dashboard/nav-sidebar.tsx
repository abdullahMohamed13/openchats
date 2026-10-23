"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Close, Plus, Search } from "pixelarticons/react";
import { cn } from "@/lib/utils";
import "@/styles/retro.css";
import { ChannelItem } from "./channel-item";
import { DMItem } from "./dm-item";
import type { ChannelSummary, DirectMessageSummary } from "./types";

interface NavSidebarProps {
	workspaceName: string;
	currentUserBadge?: string;
	channels: ChannelSummary[];
	dms: DirectMessageSummary[];
	activeConversationId: string;
	onSelectConversation: (id: string) => void;
	open?: boolean;
	onClose?: () => void;
}

export function NavSidebar({
	workspaceName,
	currentUserBadge,
	channels,
	dms,
	activeConversationId,
	onSelectConversation,
	open,
	onClose,
}: NavSidebarProps) {
	const [channelsOpen, setChannelsOpen] = useState(true);
	const [dmsOpen, setDmsOpen] = useState(true);
	const [query, setQuery] = useState("");
	const [badgeBroken, setBadgeBroken] = useState(false);

	const normalized = query.trim().toLowerCase();
	const filteredChannels = normalized
		? channels.filter((channel) => channel.name.toLowerCase().includes(normalized))
		: channels;
	const filteredDms = normalized
		? dms.filter((dm) => dm.name.toLowerCase().includes(normalized))
		: dms;

	return (
		<div className={cn("pointer-events-none absolute inset-0 z-30 flex lg:static", open && "pointer-events-auto")}>
			{open && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />}

			<nav
				aria-label="Workspace navigation"
				className={cn(
					"pointer-events-auto relative z-30 flex h-full w-64 shrink-0 flex-col border-r border-border bg-background transition-transform duration-200 lg:translate-x-0",
					open ? "translate-x-0" : "-translate-x-full lg:static"
				)}
			>
				<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
					<h2 className="truncate font-press-start text-[11px] uppercase text-foreground">{workspaceName}</h2>
					<button
						type="button"
						aria-label="Close navigation"
						onClick={onClose}
						className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
					>
						<Close width={16} height={16} />
					</button>
				</div>

				<div className="px-3 py-2">
					<label className="relative block">
						<span className="sr-only">Search</span>
						<Search width={16} height={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search"
							className="w-full rounded-md border border-border bg-muted py-1.5 pl-8 pr-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
						/>
					</label>
				</div>

				<div className="flex-1 overflow-y-auto px-2 pb-3">
					<SectionHeader
						label="Channels"
						open={channelsOpen}
						onToggle={() => setChannelsOpen((open) => !open)}
						action={
							<button
								type="button"
								aria-label="Create channel"
								className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								+</button>
						}
					/>
					{channelsOpen &&
						(filteredChannels.length > 0 ? (
							<div className="flex flex-col gap-0.5 px-1 pb-3">
								{filteredChannels.map((channel) => (
									<ChannelItem
										key={channel.id}
										name={channel.name}
										unreadCount={channel.unreadCount}
										isActive={activeConversationId === channel.id}
										onSelect={() => onSelectConversation(channel.id)}
									/>
								))}
							</div>
						) : (
							<p className="px-2 pb-3 text-xs text-muted-foreground">
								{query ? `No channels match “${query}”.` : "No channels yet."}
							</p>
						))}

					<SectionHeader
						label="Direct messages"
						open={dmsOpen}
						onToggle={() => setDmsOpen((open) => !open)}
						action={
							badgeBroken ? (
								<Plus
									width={12}
									height={12}
									aria-label="Start a new direct message"
									className="cursor-pointer hover:opacity-80"
								/>
							) : (
								<Image
									src={currentUserBadge ?? "/images/badges/knight-shield.webp"}
									alt="New direct message"
									width={12}
									height={12}
									title="Start a new direct message"
									onError={() => setBadgeBroken(true)}
									className="pixelated cursor-pointer hover:opacity-80"
								/>
							)
						}
					/>
					{dmsOpen &&
						(filteredDms.length > 0 ? (
							<div className="flex flex-col gap-0.5 px-1">
								{filteredDms.map((dm) => (
									<DMItem
										key={dm.id}
										name={dm.name}
										avatar={dm.avatar}
										status={dm.status}
										unreadCount={dm.unreadCount}
										isActive={activeConversationId === dm.id}
										onSelect={() => onSelectConversation(dm.id)}
									/>
								))}
							</div>
						) : (
							<p className="px-2 text-xs text-muted-foreground">
								{query ? `No people match “${query}”.` : "No direct messages yet."}
							</p>
						))}
				</div>
			</nav>
		</div>
	);
}

interface SectionHeaderProps {
	label: string;
	open: boolean;
	onToggle: () => void;
	action?: React.ReactNode;
}

function SectionHeader({ label, open, onToggle, action }: SectionHeaderProps) {
	return (
		<div className="flex items-center justify-between px-1 py-1.5">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={open}
				className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				<ChevronDown width={14} height={14} className={cn("transition-transform", !open && "-rotate-90")} aria-hidden />
				{label}
			</button>
			{action}
		</div>
	);
}
