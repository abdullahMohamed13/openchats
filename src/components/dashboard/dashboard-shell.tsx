"use client";

import { useMemo, useState } from "react";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { NavSidebar } from "./nav-sidebar";
import { ConversationArea } from "./conversation-area";
import { MOCK_USERS } from "@/data/dashboard/users";
import { MOCK_WORKSPACES } from "@/data/dashboard/workspaces";
import { MOCK_CHANNELS } from "@/data/dashboard/channels";
import { MOCK_DMS } from "@/data/dashboard/dms";
import { MOCK_MESSAGES, type ConversationKey } from "@/data/dashboard/messages";
import { authClient } from "@/lib/auth-client";
import type { MockUser } from "@/data/dashboard/users";

interface ResolvedConversation {
  key: ConversationKey;
  title: string;
  subtitle: string;
  unreadCount: number;
}

export function DashboardShell() {
  const { data: session } = authClient.useSession();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("openchats");
  const [activeConversation, setActiveConversation] = useState<ConversationKey>("general");
  const [navOpen, setNavOpen] = useState(false);

  const currentUser = useMemo<MockUser>(() => {
    const user = session?.user;
    if (!user) return MOCK_USERS[0];
    return {
      id: user.id,
      name: user.name ?? "You",
      avatar: user.image ?? MOCK_USERS[0].avatar,
      badge: user.badge ?? undefined,
      status: "online",
      title: user.role ?? "Member",
    };
  }, [session?.user]);

  const activeWorkspace = MOCK_WORKSPACES.find((workspace) => workspace.id === activeWorkspaceId) ?? MOCK_WORKSPACES[0];

  const workspace = useMemo(() => MOCK_CHANNELS.filter((channel) => channel.workspaceId === activeWorkspaceId), [activeWorkspaceId]);
  const dms = useMemo(() => MOCK_DMS.filter((dm) => dm.workspaceId === activeWorkspaceId), [activeWorkspaceId]);

  const conversation = useMemo<ResolvedConversation | null>(() => {
    const channel = workspace.find((item) => item.id === activeConversation);
    if (channel) {
      return {
        key: channel.id,
        title: `# ${channel.name}`,
        subtitle: channel.description,
        unreadCount: channel.unreadCount,
      };
    }

    const dm = dms.find((item) => item.id === activeConversation);
    if (dm) {
      const user = MOCK_USERS.find((item) => item.id === dm.userId) ?? MOCK_USERS[0];
      return {
        key: dm.id,
        title: user.name,
        subtitle: `${user.status.charAt(0).toUpperCase()}${user.status.slice(1)} · ${user.title ?? "Member"}`,
        unreadCount: dm.unreadCount,
      };
    }

    return null;
  }, [workspace, dms, activeConversation]);

  const messages = useMemo(
    () => (conversation ? (MOCK_MESSAGES[conversation.key] ?? []) : []),
    [conversation]
  );

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    const firstChannel = MOCK_CHANNELS.find((channel) => channel.workspaceId === id);
    setActiveConversation((firstChannel?.id ?? "") as ConversationKey);
    setNavOpen(false);
  };

  const handleSelectConversation = (key: ConversationKey) => {
    setActiveConversation(key);
    setNavOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <WorkspaceSidebar
        workspaces={MOCK_WORKSPACES}
        activeWorkspaceId={activeWorkspaceId}
        currentUser={currentUser}
        onSelectWorkspace={handleSelectWorkspace}
      />

      <NavSidebar
        workspaceName={activeWorkspace.name}
        workspaces={MOCK_WORKSPACES}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        channels={workspace}
        dms={dms}
        users={MOCK_USERS}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <ConversationArea
        key={conversation?.key ?? "empty"}
        conversationKey={conversation?.key ?? "empty"}
        title={conversation?.title ?? "OpenChats"}
        subtitle={conversation?.subtitle ?? "Select a conversation to get started"}
        unreadCount={conversation?.unreadCount}
        messages={messages}
        users={MOCK_USERS}
        currentUser={currentUser}
        showMenuButton
        onToggleNav={() => setNavOpen((open) => !open)}
      />
    </div>
  );
}