export type UseCase = {
	title: string;
	heading: string;
	description: string;
};

export const USE_CASES: UseCase[] = [
	{
		title: "Teams",
		heading: "Your team, all in one place",
		description:
			"Keep your team aligned with organized channels for projects, departments, and daily standups. Share files, send quick updates, and keep work conversations searchable and out of email.",
	},
	{
		title: "Clubs & Societies",
		heading: "Coordinate, announce, celebrate",
		description:
			"Run your student club or society from one place. Coordinate events, share announcements, manage sign-ups, and keep conversations going between meetings.",
	},
	{
		title: "Communities",
		heading: "A home for every community",
		description:
			"Bring your community together with topic-based channels, direct messages, and shared spaces. Whether it's a hobby group, open-source project, or local organization, everyone stays in the loop.",
	},
];
