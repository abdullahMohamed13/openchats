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
	loading?: boolean;
	activeConversationId: string;
	onSelectConversation: (id: string) => void;
	onSelectWorkspace: (id: string) => void;
	onCreateWorkspace?: () => void;
	onCreateChannel?: () => void;
	onStartDirectMessage?: () => void;
	onOpenInvite?: () => void;
	onOpenInvitations?: () => void;
	invitationCount?: number;
	onOpenJoinRequests?: () => void;
	joinRequestCount?: number;
	onOpenSettings?: () => void;
	open?: boolean;
	collapsed?: boolean;
	onClose?: () => void;
}