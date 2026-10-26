export type UserStatus = "online" | "away" | "offline";

export const DEFAULT_AVATAR = "/images/characters/waltuh.webp";

export interface ChannelSummary {
	id: string;
	name: string;
	unreadCount: number;
}

export interface DirectMessageSummary {
	id: string;
	name: string;
	avatar: string;
	status: UserStatus;
	unreadCount: number;
}

export interface CurrentUser {
	name: string;
	avatar: string;
	title?: string;
	badge?: string;
}
