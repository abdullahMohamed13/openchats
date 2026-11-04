"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Check,
	ChevronDown,
	Close,
	Home,
	Inbox,
	Plus,
	Search,
	Settings2,
	UserPlus,
} from "pixelarticons/react";
import { Button } from "@/components/ui/8bit/button";
import { cn } from "@/lib/utils";
import "@/styles/retro.css";
import { ChannelItem } from "./channel/ChannelItem";
import { DMItem } from "./dm/DMItem";
import { WorkspaceAvatar } from "./workspace/WorkspaceAvatar";
import { NavSidebarProps } from "@/types/navbar";

const MAX_VISIBLE_WORKSPACES = 6;

export function NavSidebar({
	workspaceName,
	workspaceImageUrl,
	workspaces,
	activeWorkspaceId,
	canManageWorkspace,
	channels,
	dms,
	loading = false,
	activeConversationId,
	onSelectConversation,
	onSelectWorkspace,
	onCreateWorkspace,
	onCreateChannel,
	onStartDirectMessage,
	onOpenInvite,
	onOpenJoinRequests,
	joinRequestCount = 0,
	onOpenSettings,
	open,
	collapsed,
	onClose,
	isGuest = false,
}: NavSidebarProps & { isGuest?: boolean }) {
	const [channelsOpen, setChannelsOpen] = useState(true);
	const [dmsOpen, setDmsOpen] = useState(true);
	const [query, setQuery] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);

	const visibleWorkspaces = showAllWorkspaces
		? workspaces
		: workspaces.slice(0, MAX_VISIBLE_WORKSPACES);
	const hasMoreWorkspaces = workspaces.length > MAX_VISIBLE_WORKSPACES;

	const normalized = query.trim().toLowerCase();
	const filteredChannels = normalized
		? channels.filter((channel) => channel.name.toLowerCase().includes(normalized))
		: channels;
	const filteredDms = normalized
		? dms.filter((dm) => dm.name.toLowerCase().includes(normalized))
		: dms;

	return (
		<div className={cn("pointer-events-none absolute inset-0 z-30 flex lg:static", open && "pointer-events-auto", collapsed && "lg:hidden")}>
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
							onClick={() => {
								setMenuOpen((value) => !value);
								setShowAllWorkspaces(false);
							}}
							aria-expanded={menuOpen}
							aria-haspopup="menu"
							className="flex w-full min-w-0 items-center gap-1.5 text-foreground"
						>
							<WorkspaceAvatar
								name={workspaceName}
								imageUrl={workspaceImageUrl}
								className="size-6 shrink-0 rounded border border-border"
								initialsClassName="text-[8px]"
							/>
							<h2 className="min-w-0 truncate font-press-start text-[11px] uppercase">{workspaceName}</h2>
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
									className="absolute left-0 top-full z-50 mt-2 flex w-max min-w-56 max-w-[calc(100vw-2rem)] flex-col border-2 border-foreground bg-background shadow-[4px_4px_0px_var(--foreground)]"
								>
									<p className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
										Workspaces
									</p>
									<div
										className={cn(
											"overflow-y-auto p-1",
											showAllWorkspaces ? "max-h-80" : "max-h-48",
										)}
									>
										{visibleWorkspaces.map((workspace) => (
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
												<WorkspaceAvatar
													name={workspace.name}
													imageUrl={workspace.imageUrl}
													className="size-5 shrink-0 rounded border border-border"
													initialsClassName="text-[7px]"
												/>
												<span className="flex-1 whitespace-nowrap">{workspace.name}</span>
												{workspace._id === activeWorkspaceId && (
													<Check width={14} height={14} className="shrink-0 text-primary" aria-hidden />
												)}
											</button>
										))}
									</div>
									{hasMoreWorkspaces && (
										<button
											type="button"
											role="menuitem"
											onClick={() => setShowAllWorkspaces((value) => !value)}
											aria-expanded={showAllWorkspaces}
											className="border-t border-border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-muted"
										>
											{showAllWorkspaces ? "Show less" : "Show more"}
										</button>
									)}
									<div className={`${!isGuest && "border-t border-border p-1"}`}>
										{canManageWorkspace && onOpenJoinRequests && (
											<MenuAction
												icon={<Inbox width={14} height={14} />}
												label={`Join requests${joinRequestCount > 0 ? ` (${joinRequestCount})` : ""}`}
												onClick={() => {
													setMenuOpen(false);
													onOpenJoinRequests();
												}}
											/>
										)}
										{canManageWorkspace && !isGuest && onOpenInvite && (
											<MenuAction
												icon={<UserPlus width={14} height={14} />}
												label="Invite people"
												onClick={() => {
													setMenuOpen(false);
													onOpenInvite?.();
												}}
											/>
										)}
										{!isGuest && onOpenSettings && (
											<MenuAction
												icon={<Settings2 width={14} height={14} />}
												label="Workspace settings"
												onClick={() => {
													setMenuOpen(false);
													onOpenSettings?.();
												}}
											/>
										)}
										{!isGuest && onCreateWorkspace && (
											<MenuAction
												icon={<Plus width={14} height={14} />}
												label="New workspace"
												onClick={() => {
													setMenuOpen(false);
													onCreateWorkspace?.();
												}}
											/>
										)}
									</div>
								</div>
							</>
						)}
					</div>
					<Link
						href="/"
						aria-label="Go home"
						title="Go home"
						className="flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
					>
						<Home width={16} height={16} aria-hidden />
					</Link>
					<button
						type="button"
						aria-label="Close navigation"
						title="Close navigation"
						onClick={onClose}
						className="flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground lg:hidden"
					>
						<Close width={16} height={16} aria-hidden />
					</button>
				</div>

				<div className="relative px-3 py-2">
					<Search
						width={16}
						height={16}
						className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
						aria-hidden
					/>
					<input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search"
						aria-label="Search"
						className="h-10 w-full border-2 border-foreground bg-background pl-8 pr-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/85 focus:shadow-[3px_3px_0px_var(--primary)]"
					/>
				</div>

				<div className="flex-1 overflow-y-auto px-2 pb-3">
					<SectionHeader
						label="Channels"
						open={channelsOpen}
						onToggle={() => setChannelsOpen((open) => !open)}
						action={
							!isGuest && onCreateChannel && (
								<Button
									type="button"
									aria-label="Create channel"
									onClick={onCreateChannel}
									variant="ghost"
									size="sm"
									className="size-5 p-0 text-muted-foreground"
								>
									+
								</Button>
							)
						}
					/>
					{channelsOpen &&
						(loading ? (
							<p className="px-2 pb-3 text-xs text-muted-foreground">Loading…</p>
						) : filteredChannels.length > 0 ? (
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

					{!isGuest && (
						<SectionHeader
							label="Direct messages"
							open={dmsOpen}
							onToggle={() => setDmsOpen((open) => !open)}
							action={
								onStartDirectMessage && (
									<Button
										type="button"
										aria-label="Start a new direct message"
										title="Start a new direct message"
										onClick={onStartDirectMessage}
										variant="ghost"
										size="sm"
										className="size-5 p-0 text-muted-foreground"
									>
										+
									</Button>
								)
							}
						/>
					)}
					{!isGuest && dmsOpen &&
						(loading ? (
							<p className="px-2 text-xs text-muted-foreground">Loading…</p>
						) : filteredDms.length > 0 ? (
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