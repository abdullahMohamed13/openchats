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

export type WorkspaceRole = "owner" | "admin" | "member";

export interface WorkspaceSummary {
	_id: string;
	name: string;
	slug: string;
	role: WorkspaceRole;
	joinedAt: number;
	createdAt: number;
}

export interface WorkspaceMember {
	userId: string;
	name: string;
	username: string | null;
	email: string | null;
	image: string | null;
	role: WorkspaceRole;
	joinedAt: number;
}
