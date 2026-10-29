"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
// Types
import type { Event } from "stream-chat";
import { DEFAULT_AVATAR, type CurrentUser } from "@/types/chat";
// Hooks
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useChatContext } from "stream-chat-react";
import { useConversations } from "@/hooks/use-conversations";
// Icons
import { Menu } from "pixelarticons/react";
// Components
import { WorkspaceSidebar } from "./workspace/workspace-sidebar";
import { NavSidebar } from "./nav-sidebar";
import { ConversationArea } from "./conversation/conversation-area";
import { CreateWorkspaceDialog } from "./workspace/create-workspace-dialog";
import { CreateChannelDialog } from "./channel/create-channel-dialog";
import { InviteDialog } from "./invite/invite-dialog";
import { WorkspaceSettingsDialog } from "./workspace/workspace-settings-dialog";
import { ChannelSettingsDialog } from "./channel/channel-settings-dialog";
import { NewDirectMessageDialog } from "./dm/new-direct-message-dialog";
import { NotificationsDialog } from "./notifications/notifications-dialog";

interface ChatShellProps {
	workspaceId: Id<"workspaces">;
}

export function ChatShell({ workspaceId }: ChatShellProps) {
	const router = useRouter();
	const workspaces = useQuery(api.workspaces.listMyWorkspaces);
	const dbChannels = useQuery(api.channels.listWorkspaceChannels, {
		workspaceId,
	});
	const { client } = useChatContext();
	const { data: session } = authClient.useSession();
	const { channels, dms, loading, refresh } = useConversations(
		client,
		workspaceId,
	);
	const [selectedId, setSelectedId] = useState("");
	const [navOpen, setNavOpen] = useState(false);
	const [navCollapsed, setNavCollapsed] = useState(false);
	const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);
	const [newDmOpen, setNewDmOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);

	const currentUser = useMemo<CurrentUser>(() => {
		const user = session?.user;
		return {
			name: user?.name ?? "You",
			avatar: user?.image ?? DEFAULT_AVATAR,
			title: user?.role ?? "Member",
			badge: user?.badge ?? undefined,
		};
	}, [session?.user]);

	const activeWorkspace = workspaces?.find(
		(workspace) => workspace._id === workspaceId,
	);

	useEffect(() => {
		if (workspaces !== undefined && !activeWorkspace) {
			router.replace("/chat");
		}
	}, [workspaces, activeWorkspace, router]);

	useEffect(() => {
		const handleChannelRemoved = (event: Event) => {
			if (!event.cid) return;
			const channelId = event.cid.split(":").slice(1).join(":");
			setSelectedId((current) => (current === channelId ? "" : current));
			setChannelSettingsOpen(false);
		};

		client.on("channel.deleted", handleChannelRemoved);
		client.on("notification.removed_from_channel", handleChannelRemoved);

		return () => {
			client.off("channel.deleted", handleChannelRemoved);
			client.off("notification.removed_from_channel", handleChannelRemoved);
		};
	}, [client]);

	if (workspaces === undefined) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-background text-sm text-muted-foreground">
				Loading workspace…
			</div>
		);
	}

	if (!activeWorkspace) return null;

	const activeId = selectedId || channels[0]?.id || dms[0]?.id || "";

	const activeChannel = channels.find((channel) => channel.id === activeId);
	const activeDm = dms.find((dm) => dm.id === activeId);
	const activeChannelRow = activeChannel
		? dbChannels?.find((channel) => channel.streamId === activeChannel.id)
		: undefined;
	const canManageChannels = activeWorkspace.role !== "member";
	const notificationCount =
		channels.reduce((total, channel) => total + channel.unreadCount, 0) +
		dms.reduce((total, dm) => total + dm.unreadCount, 0);

	const resolved = activeChannel
		? { title: `# ${activeChannel.name}`, subtitle: "Channel" }
		: activeDm
			? { title: activeDm.name, subtitle: `${activeDm.status.charAt(0).toUpperCase()}${activeDm.status.slice(1)}` }
			: null;

	const handleSelect = (id: string) => {
		setSelectedId(id);
		setNavOpen(false);
	};

	const handleToggleNav = () => {
		if (window.matchMedia("(min-width: 1024px)").matches) {
			setNavCollapsed((collapsed) => !collapsed);
		} else {
			setNavOpen((open) => !open);
		}
	};

	const handleSelectWorkspace = (id: string) => {
		setNavOpen(false);
		if (id !== workspaceId) router.push(`/w/${id}`);
	};

	const handleOpenNotifications = () => {
		setNotificationsOpen(true);
		void refresh();
	};

	const handleMarkAllRead = async () => {
		await client.markAllRead();
		await refresh();
	};

	const handleDirectMessageCreated = async (channelId: string) => {
		await refresh();
		setSelectedId(channelId);
		setNewDmOpen(false);
	};

	const emptyState = (
		<main className="flex min-w-0 flex-1 flex-col bg-background">
			<header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
				<button
					type="button"
					aria-label="Toggle navigation"
					onClick={handleToggleNav}
					className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<Menu width={20} height={20} />
				</button>
				<span className="truncate font-press-start text-[11px] uppercase text-foreground">
					{activeWorkspace.name}
				</span>
			</header>
			<div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
				{loading ? "Loading conversations…" : "No conversations yet."}
			</div>
		</main>
	);

	return (
		<div className="flex h-screen w-full bg-background text-foreground">
			<WorkspaceSidebar
				currentUser={currentUser}
				workspaces={workspaces}
				activeWorkspaceId={workspaceId}
				onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
				onOpenSettings={() => setSettingsOpen(true)}
			/>

			<NavSidebar
				workspaceName={activeWorkspace.name}
				workspaceImageUrl={activeWorkspace.imageUrl}
				workspaces={workspaces}
				activeWorkspaceId={workspaceId}
				canManageWorkspace={activeWorkspace.role !== "member"}
				currentUserBadge={currentUser.badge}
				channels={channels}
				dms={dms}
				activeConversationId={activeId}
				onSelectConversation={handleSelect}
				onSelectWorkspace={handleSelectWorkspace}
				onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
				onCreateChannel={() => setCreateChannelOpen(true)}
				onStartDirectMessage={() => setNewDmOpen(true)}
				onOpenInvite={() => setInviteOpen(true)}
				onOpenSettings={() => setSettingsOpen(true)}
				open={navOpen}
				collapsed={navCollapsed}
				onClose={() => setNavOpen(false)}
			/>

			{loading && !resolved ? (
				emptyState
			) : resolved ? (
				<ConversationArea
					key={activeId}
					channelId={activeId}
					title={resolved.title}
					subtitle={resolved.subtitle}
					showMenuButton
					onToggleNav={handleToggleNav}
					onOpenChannelSettings={
						activeChannelRow && canManageChannels
							? () => setChannelSettingsOpen(true)
							: undefined
					}
					onOpenNotifications={handleOpenNotifications}
					notificationCount={notificationCount}
				/>
			) : (
				emptyState
			)}

			{createWorkspaceOpen && (
				<CreateWorkspaceDialog
					onClose={() => setCreateWorkspaceOpen(false)}
				/>
			)}
			{createChannelOpen && (
				<CreateChannelDialog
					workspaceId={workspaceId}
					onClose={() => setCreateChannelOpen(false)}
					onCreated={(channelId) => {
						setSelectedId(channelId);
						setCreateChannelOpen(false);
					}}
				/>
			)}
			{newDmOpen && (
				<NewDirectMessageDialog
					workspaceId={workspaceId}
					onClose={() => setNewDmOpen(false)}
					onCreated={handleDirectMessageCreated}
				/>
			)}
			{notificationsOpen && (
				<NotificationsDialog
					channels={channels}
					dms={dms}
					onSelect={handleSelect}
					onMarkAllRead={handleMarkAllRead}
					onClose={() => setNotificationsOpen(false)}
				/>
			)}
			{inviteOpen && (
				<InviteDialog
					workspaceId={workspaceId}
					onClose={() => setInviteOpen(false)}
				/>
			)}
			{settingsOpen && (
				<WorkspaceSettingsDialog
					workspaceId={workspaceId}
					workspaceName={activeWorkspace.name}
					workspaceImageUrl={activeWorkspace.imageUrl}
					role={activeWorkspace.role}
					onClose={() => setSettingsOpen(false)}
					onInvite={() => {
						setSettingsOpen(false);
						setInviteOpen(true);
					}}
				/>
			)}
			{channelSettingsOpen && activeChannel && activeChannelRow && (
				<ChannelSettingsDialog
					channelId={activeChannelRow._id}
					channelName={activeChannel.name}
					isGeneral={activeChannelRow.name === "general"}
					onClose={() => setChannelSettingsOpen(false)}
					onDeleted={() => {
						setSelectedId("");
						setChannelSettingsOpen(false);
					}}
				/>
			)}
		</div>
	);
}
