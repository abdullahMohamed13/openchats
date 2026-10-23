"use client";

import { useMemo, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { NavSidebar } from "./nav-sidebar";
import { ConversationArea } from "./conversation-area";
import { useConversations } from "./use-conversations";
import { DEFAULT_AVATAR, type CurrentUser } from "./types";
import { authClient } from "@/lib/auth-client";

export function DashboardShell() {
	const { client } = useChatContext();
	const { data: session } = authClient.useSession();
	const { channels, dms, loading } = useConversations(client);
	const [selectedId, setSelectedId] = useState("");
	const [navOpen, setNavOpen] = useState(false);

	const currentUser = useMemo<CurrentUser>(() => {
		const user = session?.user;
		return {
			name: user?.name ?? "You",
			avatar: user?.image ?? DEFAULT_AVATAR,
			title: user?.role ?? "Member",
			badge: user?.badge ?? undefined,
		};
	}, [session?.user]);

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

	return (
		<div className="flex h-screen w-full bg-background text-foreground">
			<WorkspaceSidebar currentUser={currentUser} />

			<NavSidebar
				workspaceName="OpenChats"
				currentUserBadge={currentUser.badge}
				channels={channels}
				dms={dms}
				activeConversationId={activeId}
				onSelectConversation={handleSelect}
				open={navOpen}
				onClose={() => setNavOpen(false)}
			/>

			{loading && !resolved ? (
				<main className="flex min-w-0 flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
					Loading conversations…
				</main>
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
				<main className="flex min-w-0 flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
					No conversations yet.
				</main>
			)}
		</div>
	);
}
