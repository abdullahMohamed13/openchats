import { ChannelSummary, DirectMessageSummary } from "./chat";

interface Conversations {
	channels: ChannelSummary[];
	dms: DirectMessageSummary[];
	loading: boolean;
}

interface ConversationAreaProps {
  channelId: string;
  title: string;
  subtitle: string;
  unreadCount?: number;
  showMenuButton?: boolean;
  onToggleNav?: () => void;
  onOpenChannelSettings?: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
}

interface ConversationHeaderProps {
  title: string;
  subtitle: string;
  unreadCount?: number;
  showMenuButton?: boolean;
  onToggleNav?: () => void;
  onOpenChannelSettings?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
}

interface ConversationSearchDialogProps {
	onClose: () => void;
}

export type {
	Conversations,
	ConversationAreaProps,
	ConversationHeaderProps,
	ConversationSearchDialogProps
}