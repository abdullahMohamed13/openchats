export type ConversationKey = string;

export interface MockMessage {
  id: string;
  conversationId: ConversationKey;
  userId: string;
  content: string;
  time: string;
  reactions?: { emoji: string; by: string[] }[];
  isNewUnread?: boolean;
}

export const UNREAD_DIVIDER_ID = "unread-divider";

export const MOCK_MESSAGES: Record<ConversationKey, MockMessage[]> = {
  general: [
    {
      id: "m1",
      conversationId: "general",
      userId: "sarah-ahmed",
      content:
        "Morning team! Quick heads-up: the onboarding flow is live on staging. Would love eyes on the wizard before we ship.",
      time: "9:42 AM",
      reactions: [{ emoji: "👍", by: ["mohamed-ali", "youssef-hassan"] }],
    },
    {
      id: "m2",
      conversationId: "general",
      userId: "mohamed-ali",
      content: "Nice! I'll run through it after standup. Anything specific to check?",
      time: "9:47 AM",
    },
    {
      id: "m3",
      conversationId: "general",
      userId: "youssef-hassan",
      content:
        "The avatar picker on small screens wraps a bit awkwardly. I uploaded a screenshot to the #design channel.",
      time: "9:51 AM",
    },
    {
      id: "m4",
      conversationId: "general",
      userId: "you",
      content:
        "Good catch. Let's bump the grid to 3 columns below sm and make the upload button full-width on mobile.",
      time: "9:58 AM",
      reactions: [{ emoji: "👀", by: ["sarah-ahmed"] }],
    },
    {
      id: "m5",
      conversationId: "general",
      userId: "sarah-ahmed",
      content:
        "Deploying to main later today. After that, focus shifts to the dashboard — I think we're close to an MVP we can demo.",
      time: "10:04 AM",
    },
    {
      id: "m6",
      conversationId: "general",
      userId: "omar-khaled",
      content: "I'm available to QA the dashboard shell when it's ready. Just say the word.",
      time: "10:12 AM",
    },
  ],
  announcements: [
    {
      id: "m7",
      conversationId: "announcements",
      userId: "sarah-ahmed",
      content: "Ship has shipped 🎉 Landing page + auth + onboarding are now live at openchats.qzz.io",
      time: "Yesterday",
      reactions: [{ emoji: "🎉", by: ["mohamed-ali", "youssef-hassan", "you", "omar-khaled"] }],
    },
    {
      id: "m8",
      conversationId: "announcements",
      userId: "you",
      content: "Sprint 2 kicks off Monday. Workspaces, channels and the real-time layer are on the board.",
      time: "Yesterday",
      reactions: [{ emoji: "🚀", by: ["mohamed-ali"] }],
    },
    {
      id: "m9",
      conversationId: "announcements",
      userId: "sarah-ahmed",
      content: "Standup moved to 9:30 — same Zoom link.",
      time: "8:15 AM",
      isNewUnread: true,
    },
    {
      id: "m10",
      conversationId: "announcements",
      userId: "mohamed-ali",
      content: "Reminder: commit messages stay conventional and each feature PR targets develop.",
      time: "8:20 AM",
      isNewUnread: true,
    },
  ],
  development: [
    {
      id: "m11",
      conversationId: "development",
      userId: "mohamed-ali",
      content: "Pushed the Convex schema draft with workspaces + channels tables. Comments welcome.",
      time: "11:02 AM",
      reactions: [{ emoji: "🤝", by: ["you"] }],
    },
    {
      id: "m12",
      conversationId: "development",
      userId: "you",
      content:
        "Schema looks solid. One thought: should memberships be soft-deletable so people can rejoin without losing history?",
      time: "11:15 AM",
    },
    {
      id: "m13",
      conversationId: "development",
      userId: "mohamed-ali",
      content: "Good idea — I'll add an active flag and keep row history. Stream Chat tokens generate server-side anyway.",
      time: "11:21 AM",
      isNewUnread: true,
    },
    {
      id: "m14",
      conversationId: "development",
      userId: "sarah-ahmed",
      content: "Typegen is wired in CI. Every PR now runs lint + tsc before merge.",
      time: "11:40 AM",
      isNewUnread: true,
    },
  ],
  design: [
    {
      id: "m15",
      conversationId: "design",
      userId: "youssef-hassan",
      content:
        "Uploaded the mobile mock for the dashboard. Conversation stays primary, sidebars become drawers.",
      time: "Yesterday",
      reactions: [{ emoji: "🎨", by: ["you", "sarah-ahmed"] }],
    },
    {
      id: "m16",
      conversationId: "design",
      userId: "you",
      content: "This matches the plan. I'll use it as the reference for the responsive pass.",
      time: "Yesterday",
    },
  ],
  random: [
    {
      id: "m17",
      conversationId: "random",
      userId: "omar-khaled",
      content: "Who's up for a late-night Valorant session this weekend? 🎮",
      time: "12:30 PM",
      reactions: [{ emoji: "😄", by: ["mohamed-ali", "you"] }],
    },
    {
      id: "m18",
      conversationId: "random",
      userId: "mohamed-ali",
      content: "In. Same squad as last time.",
      time: "12:41 PM",
      isNewUnread: true,
    },
  ],
  "dm-sarah": [
    {
      id: "m19",
      conversationId: "dm-sarah",
      userId: "sarah-ahmed",
      content: "Can you review the PR when you have a sec? The onboarding guard change is in there.",
      time: "10:30 AM",
    },
    {
      id: "m20",
      conversationId: "dm-sarah",
      userId: "you",
      content: "On it — will leave comments in 15.",
      time: "10:33 AM",
    },
    {
      id: "m21",
      conversationId: "dm-sarah",
      userId: "sarah-ahmed",
      content: "Legend 🙌",
      time: "10:34 AM",
      isNewUnread: true,
    },
  ],
  "dm-mohamed": [
    {
      id: "m22",
      conversationId: "dm-mohamed",
      userId: "mohamed-ali",
      content: "Deploy script is sorted. Ready to ship whenever you are.",
      time: "Yesterday",
    },
    {
      id: "m23",
      conversationId: "dm-mohamed",
      userId: "you",
      content: "Perfect. Let's ship after standup tomorrow.",
      time: "Yesterday",
    },
  ],
  "dm-youssef": [
    {
      id: "m24",
      conversationId: "dm-youssef",
      userId: "you",
      content: "Pinged you about the avatar grid — check #design when free.",
      time: "9:59 AM",
    },
  ],
  "dm-omar": [
    {
      id: "m25",
      conversationId: "dm-omar",
      userId: "omar-khaled",
      content: "QA checklist for the dashboard is drafted. Sharing it in #development.",
      time: "11:05 AM",
    },
  ],
  "dm-nour": [
    {
      id: "m26",
      conversationId: "dm-nour",
      userId: "nour-eldeen",
      content: "The IEEE website migration is confirmed for next month. Let's align the members.",
      time: "9:10 AM",
      isNewUnread: true,
    },
  ],
  "dm-menna": [
    {
      id: "m27",
      conversationId: "dm-menna",
      userId: "menna-fawzy",
      content: "Workshop posters are done — sending final files tonight.",
      time: "Yesterday",
    },
  ],
  "dm-hazem": [
    {
      id: "m28",
      conversationId: "dm-hazem",
      userId: "hazem-adel",
      content: "Draft firmware pushed to personal-projects repo.",
      time: "Monday",
    },
  ],
};