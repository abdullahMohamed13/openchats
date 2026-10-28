"use client";

import { useState } from "react";
import Image from "next/image";
import {
	Check,
	ChevronDown,
	Close,
	Plus,
	Search,
	Settings2,
	UserPlus,
} from "pixelarticons/react";
import { cn } from "@/lib/utils";
import "@/styles/retro.css";
import { ChannelItem } from "./channel-item";
import { DMItem } from "./dm-item";
import type {
	ChannelSummary,
	DirectMessageSummary,
	WorkspaceSummary,
} from "./types";

interface NavSidebarProps {
	workspaceName: string;
	workspaces: WorkspaceSummary[];
	activeWorkspaceId: string;
	canManageWorkspace: boolean;
	currentUserBadge?: string;
	channels: ChannelSummary[];
	dms: DirectMessageSummary[];
	activeConversationId: string;
	onSelectConversation: (id: string) => void;
	onSelectWorkspace: (id: string) => void;
	onCreateWorkspace: () => void;
	onCreateChannel: () => void;
	onStartDirectMessage: () => void;
	onOpenInvite: () => void;
	onOpenSettings: () => void;
	open?: boolean;
	onClose?: () => void;
}

export function NavSidebar({
	workspaceName,
	workspaces,
	activeWorkspaceId,
	canManageWorkspace,
	currentUserBadge,
	channels,
	dms,
	activeConversationId,
	onSelectConversation,
	onSelectWorkspace,
	onCreateWorkspace,
	onCreateChannel,
	onStartDirectMessage,
	onOpenInvite,
	onOpenSettings,
	open,
	onClose,
}: NavSidebarProps) {
	const [channelsOpen, setChannelsOpen] = useState(true);
	const [dmsOpen, setDmsOpen] = useState(true);
	const [query, setQuery] = useState("");
	const [badgeBroken, setBadgeBroken] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

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
					<div className="relative min-w-0 flex-1">
						<button
							type="button"
							onClick={() => setMenuOpen((value) => !value)}
							aria-expanded={menuOpen}
							aria-haspopup="menu"
							className="flex min-w-0 items-center gap-1.5 text-foreground"
						>
							<h2 className="truncate font-press-start text-[11px] uppercase">{workspaceName}</h2>
							<ChevronDown width={14} height={14} className="shrink-0 text-muted-foreground" aria-hidden />
						</button>

						{menuOpen && (
							<>
								<button
									type="button"
									aria-label="Close workspace menu"
									onClick={() => setMenuOpen(false)}
									className="fixed inset-0 z-40 cursor-default"
								/>
								<div
									role="menu"
									className="absolute left-0 top-full z-50 mt-2 flex w-60 flex-col border-2 border-foreground bg-background shadow-[4px_4px_0px_var(--foreground)]"
								>
									<p className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
										Workspaces
									</p>
									<div className="max-h-48 overflow-y-auto p-1">
										{workspaces.map((workspace) => (
											<button
												key={workspace._id}
												type="button"
												role="menuitem"
												onClick={() => {
													setMenuOpen(false);
													onSelectWorkspace(workspace._id);
												}}
												className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
											>
												<span className="min-w-0 flex-1 truncate">{workspace.name}</span>
												{workspace._id === activeWorkspaceId && (
													<Check width={14} height={14} className="shrink-0 text-primary" aria-hidden />
												)}
											</button>
										))}
									</div>
									<div className="border-t border-border p-1">
										{canManageWorkspace && (
											<MenuAction
												icon={<UserPlus width={14} height={14} />}
												label="Invite people"
												onClick={() => {
													setMenuOpen(false);
													onOpenInvite();
												}}
											/>
										)}
										<MenuAction
											icon={<Settings2 width={14} height={14} />}
											label="Workspace settings"
											onClick={() => {
												setMenuOpen(false);
												onOpenSettings();
											}}
										/>
										<MenuAction
											icon={<Plus width={14} height={14} />}
											label="New workspace"
											onClick={() => {
												setMenuOpen(false);
												onCreateWorkspace();
											}}
										/>
									</div>
								</div>
							</>
						)}
					</div>
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
								onClick={onCreateChannel}
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
							<button
								type="button"
								aria-label="Start a new direct message"
								title="Start a new direct message"
								onClick={onStartDirectMessage}
								className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								{badgeBroken ? (
									<Plus width={12} height={12} aria-hidden />
								) : (
									<Image
										src={currentUserBadge ?? "/images/badges/knight-shield.webp"}
										alt=""
										width={12}
										height={12}
										onError={() => setBadgeBroken(true)}
										className="pixelated"
									/>
								)}
							</button>
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

interface MenuActionProps {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}

function MenuAction({ icon, label, onClick }: MenuActionProps) {
	return (
		<button
			type="button"
			role="menuitem"
			onClick={onClick}
			className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
		>
			{icon}
			{label}
		</button>
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
