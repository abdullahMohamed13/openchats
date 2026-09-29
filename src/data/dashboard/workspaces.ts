export interface MockWorkspace {
  id: string;
  name: string;
  initials: string;
  unreadCount: number;
}

export const MOCK_WORKSPACES: MockWorkspace[] = [
  { id: "openchats", name: "OpenChats", initials: "OC", unreadCount: 12 },
  { id: "ieee-elshorouk", name: "IEEE El-Shorouk", initials: "IE", unreadCount: 4 },
  { id: "personal-projects", name: "Personal Projects", initials: "PP", unreadCount: 0 },
];