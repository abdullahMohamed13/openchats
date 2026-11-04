"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
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
import { WorkspaceSidebar } from "./workspace/WorkspaceSidebar";
import { NavSidebar } from "./NavSidebar";
import { ConversationArea } from "./conversation/ConversationArea";
import { CreateWorkspaceDialog } from "./workspace/CreateWorkspaceDialog";
import { CreateChannelDialog } from "./channel/CreateChannelDialog";
import { InviteDialog } from "./invite/InviteDialog";
import { InvitationsDialog } from "./invite/InvitationsDialog";
import { WorkspaceSettingsDialog } from "./workspace/WorkspaceSettingsDialog";
import { WorkspaceJoinRequestsDialog } from "./workspace/WorkspaceJoinRequestsDialog";
import { EditProfileDialog } from "./profile/EditProfileDialog";
import { ChannelSettingsDialog } from "./channel/ChannelSettingsDialog";
import { NewDirectMessageDialog } from "./dm/NewDirectMessageDialog";
import { NotificationsDialog } from "./notifications/NotificationsDialog";

interface ChatShellProps {
	workspaceId: Id<"workspaces">;
}

export function ChatShell({ workspaceId }: ChatShellProps) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const isGuest = !!session?.user?.isAnonymous;
	const { isAuthenticated } = useConvexAuth();
	const workspaces = useQuery(
		api.workspaces.listMyWorkspaces,
		isAuthenticated ? undefined : "skip",
	);
	const dbChannels = useQuery(
		api.channels.listWorkspaceChannels,
		isAuthenticated ? { workspaceId } : "skip",
	);
	const myInvites = useQuery(
		api.invites.listMyInvites,
		isAuthenticated && !isGuest ? undefined : "skip",
	);
	const { client } = useChatContext();
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
	const [invitationsOpen, setInvitationsOpen] = useState(false);
	const [joinRequestsOpen, setJoinRequestsOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
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
	const canManageWorkspace =
		!isGuest &&
		(activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin");
	const workspaceJoinRequests = useQuery(
		api.joinRequests.listWorkspaceJoinRequests,
		canManageWorkspace ? { workspaceId } : "skip",
	);

	useEffect(() => {
		if (!isAuthenticated || !session) return;
		if (workspaces && workspaces.length > 0 && !activeWorkspace) {
			router.replace("/chat");
		}
	}, [isAuthenticated, session, workspaces, activeWorkspace, router]);

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

	if (workspaces === null) return null;

	if (!activeWorkspace) return null;

	const activeId = selectedId || channels[0]?.id || dms[0]?.id || "";

	const activeChannel = channels.find((channel) => channel.id === activeId);
	const activeDm = dms.find((dm) => dm.id === activeId);
	const activeChannelRow = activeChannel
		? dbChannels?.find((channel) => channel.streamId === activeChannel.id)
		: undefined;
	const canManageChannels = activeWorkspace.role !== "member" && !isGuest;
	const notificationCount =
		channels.reduce((total, channel) => total + channel.unreadCount, 0) +
		dms.reduce((total, dm) => total + dm.unreadCount, 0);
	const invitationCount =
		myInvites?.filter((invite) => invite.status === "active").length ?? 0;
	const joinRequestCount = workspaceJoinRequests?.length ?? 0;

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
		if (id !== workspaceId) router.push(`/chat/w/${id}`);
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
				onCreateWorkspace={isGuest ? undefined : () => setCreateWorkspaceOpen(true)}
				onOpenSettings={isGuest ? undefined : () => setSettingsOpen(true)}
				onEditProfile={isGuest ? undefined : () => setProfileOpen(true)}
				onOpenInvitations={
					isGuest ? undefined : () => setInvitationsOpen(true)
				}
				invitationCount={invitationCount}
				isGuest={isGuest}
			/>

			<NavSidebar
				workspaceName={activeWorkspace.name}
				workspaceImageUrl={activeWorkspace.imageUrl}
				workspaces={workspaces}
				activeWorkspaceId={workspaceId}
				canManageWorkspace={canManageWorkspace}
				currentUserBadge={currentUser.badge}
				channels={channels}
				dms={dms}
				loading={loading}
				activeConversationId={activeId}
				onSelectConversation={handleSelect}
				onSelectWorkspace={handleSelectWorkspace}
				onCreateWorkspace={isGuest ? undefined : () => setCreateWorkspaceOpen(true)}
				onCreateChannel={
					canManageWorkspace ? () => setCreateChannelOpen(true) : undefined
				}
				onStartDirectMessage={isGuest ? undefined : () => setNewDmOpen(true)}
				onOpenInvite={isGuest ? undefined : () => setInviteOpen(true)}
				onOpenSettings={isGuest ? undefined : () => setSettingsOpen(true)}
				onOpenInvitations={
					isGuest ? undefined : () => setInvitationsOpen(true)
				}
				invitationCount={invitationCount}
				onOpenJoinRequests={
					canManageWorkspace ? () => setJoinRequestsOpen(true) : undefined
				}
				joinRequestCount={joinRequestCount}
				open={navOpen}
				collapsed={navCollapsed}
				onClose={() => setNavOpen(false)}
				isGuest={isGuest}
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

			{!isGuest && createWorkspaceOpen && (
				<CreateWorkspaceDialog
					onClose={() => setCreateWorkspaceOpen(false)}
				/>
			)}
			{!isGuest && canManageWorkspace && createChannelOpen && (
				<CreateChannelDialog
					workspaceId={workspaceId}
					onClose={() => setCreateChannelOpen(false)}
					onCreated={(channelId) => {
						setSelectedId(channelId);
						setCreateChannelOpen(false);
					}}
				/>
			)}
			{!isGuest && newDmOpen && (
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
					isGuest={isGuest}
				/>
			)}
			{!isGuest && inviteOpen && (
				<InviteDialog
					workspaceId={workspaceId}
					onClose={() => setInviteOpen(false)}
				/>
			)}
			{!isGuest && invitationsOpen && (
				<InvitationsDialog onClose={() => setInvitationsOpen(false)} />
			)}
			{!isGuest && joinRequestsOpen && (
				<WorkspaceJoinRequestsDialog
					workspaceId={workspaceId}
					onClose={() => setJoinRequestsOpen(false)}
				/>
			)}
			{!isGuest && settingsOpen && (
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
			{!isGuest && profileOpen && (
				<EditProfileDialog onClose={() => setProfileOpen(false)} />
			)}
			{!isGuest && channelSettingsOpen && activeChannel && activeChannelRow && (
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
