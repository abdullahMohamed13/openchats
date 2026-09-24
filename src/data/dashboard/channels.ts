export interface MockChannel {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  unreadCount: number;
  isPublic?: boolean;
}

export const MOCK_CHANNELS: MockChannel[] = [
  {
    id: "general",
    workspaceId: "openchats",
    name: "general",
    description: "Team-wide announcements and general chatter",
    unreadCount: 0,
  },
  {
    id: "announcements",
    workspaceId: "openchats",
    name: "announcements",
    description: "Official news and updates",
    unreadCount: 3,
  },
  {
    id: "development",
    workspaceId: "openchats",
    name: "development",
    description: "Build, deploy, debug",
    unreadCount: 7,
  },
  {
    id: "design",
    workspaceId: "openchats",
    name: "design",
    description: "UI, UX and visual decisions",
    unreadCount: 0,
  },
  {
    id: "random",
    workspaceId: "openchats",
    name: "random",
    description: "Off-topic — memes welcome",
    unreadCount: 2,
  },
  {
    id: "ieee-general",
    workspaceId: "ieee-elshorouk",
    name: "general",
    description: "Student branch day-to-day",
    unreadCount: 0,
  },
  {
    id: "ieee-announcements",
    workspaceId: "ieee-elshorouk",
    name: "announcements",
    description: "Board updates and deadlines",
    unreadCount: 4,
  },
  {
    id: "personal-general",
    workspaceId: "personal-projects",
    name: "general",
    description: "Personal project notes",
    unreadCount: 0,
  },
];