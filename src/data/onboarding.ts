export const ROLES = [
	"Team lead",
	"Team member",
	"Student",
	"Club member",
	"Community organizer",
	"Project collaborator",
] as const;

export type Role = (typeof ROLES)[number];

export const STEPS = [
	{ title: "Username", subtitle: "What should we call you?" },
	// { title: "Phone", subtitle: "How can we reach you?" },
	{ title: "Avatar", subtitle: "Pick your role and choose an avatar" },
	{ title: "Badge", subtitle: "Pick a badge that represents you" },
] as const;