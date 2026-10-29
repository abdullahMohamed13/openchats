import type { WorkspaceSummary, ChannelSummary, DirectMessageSummary } from './chat'

export interface NavSidebarProps {
	workspaceName: string;
	workspaceImageUrl: string | null;
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
	collapsed?: boolean;
	onClose?: () => void;
}