"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useChatContext } from "stream-chat-react";
import { Menu } from "pixelarticons/react";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { NavSidebar } from "./nav-sidebar";
import { ConversationArea } from "./conversation-area";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { CreateChannelDialog } from "./create-channel-dialog";
import { InviteDialog } from "./invite-dialog";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { useConversations } from "./use-conversations";
import { DEFAULT_AVATAR, type CurrentUser } from "./types";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";

interface ChatShellProps {
	workspaceId: Id<"workspaces">;
}

export function ChatShell({ workspaceId }: ChatShellProps) {
	const router = useRouter();
	const workspaces = useQuery(api.workspaces.listMyWorkspaces);
	const { client } = useChatContext();
	const { data: session } = authClient.useSession();
	const { channels, dms, loading } = useConversations(client, workspaceId);
	const [selectedId, setSelectedId] = useState("");
	const [navOpen, setNavOpen] = useState(false);
	const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

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

	const resolved = activeChannel
		? { title: `# ${activeChannel.name}`, subtitle: "Channel" }
		: activeDm
			? { title: activeDm.name, subtitle: `${activeDm.status.charAt(0).toUpperCase()}${activeDm.status.slice(1)}` }
			: null;

	const handleSelect = (id: string) => {
		setSelectedId(id);
		setNavOpen(false);
	};

	const handleSelectWorkspace = (id: string) => {
		setNavOpen(false);
		if (id !== workspaceId) router.push(`/w/${id}`);
	};

	const emptyState = (
		<main className="flex min-w-0 flex-1 flex-col bg-background">
			<header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 lg:hidden">
				<button
					type="button"
					aria-label="Open navigation"
					onClick={() => setNavOpen(true)}
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
				onOpenInvite={() => setInviteOpen(true)}
				onOpenSettings={() => setSettingsOpen(true)}
				open={navOpen}
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
					onToggleNav={() => setNavOpen((open) => !open)}
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
					role={activeWorkspace.role}
					onClose={() => setSettingsOpen(false)}
					onInvite={() => {
						setSettingsOpen(false);
						setInviteOpen(true);
					}}
				/>
			)}
		</div>
	);
}
