export interface MockDM {
  id: string;
  workspaceId: string;
  userId: string;
  unreadCount: number;
}

export const MOCK_DMS: MockDM[] = [
  { id: "dm-sarah", workspaceId: "openchats", userId: "sarah-ahmed", unreadCount: 1 },
  { id: "dm-mohamed", workspaceId: "openchats", userId: "mohamed-ali", unreadCount: 0 },
  { id: "dm-youssef", workspaceId: "openchats", userId: "youssef-hassan", unreadCount: 0 },
  { id: "dm-omar", workspaceId: "openchats", userId: "omar-khaled", unreadCount: 0 },
  { id: "dm-nour", workspaceId: "ieee-elshorouk", userId: "nour-eldeen", unreadCount: 2 },
  { id: "dm-menna", workspaceId: "ieee-elshorouk", userId: "menna-fawzy", unreadCount: 0 },
  { id: "dm-hazem", workspaceId: "personal-projects", userId: "hazem-adel", unreadCount: 0 },
];