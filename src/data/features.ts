import primeagen from '@/assets/images/testimonials/prime.jpg'
import jeffDelaney from '@/assets/images/testimonials/jeff-delaney.jpg'

const firstTestimonial = {
	speaker: "The Primeagen",
	quote: "Every team I've ever been on has 4 Slack channels, 2 dead Discord servers, a Notion doc nobody updates, and someone still texting the deploy schedule to a group chat from 2019. That's not communication, that's a crime scene.",
	img: primeagen,
	href: 'https://www.youtube.com/@ThePrimeTimeagen',
	role: "Software Engineer & Content Creator"
}

const secondTestimonial = {
	speaker: "Jeff Delaney",
	quote: "Great teams communicate. Bad teams communicate too, but exclusively through 47 different apps.",
	img: jeffDelaney,
	href: "https://www.youtube.com/@Fireship",
	role: "Creator of Fireship"
}

const FEATURES = [
	{
		title: "Workspaces",
		description:
			"Create a dedicated space for your team, club, or community. Each workspace keeps its own members, channels, and settings so conversations stay organized and in context.",
	},
	{
		title: "Channels",
		description:
			"Organize discussions by topic, project, or purpose. Channels keep conversations focused and make it easy to find what you need later.",
	},
	{
		title: "File Sharing",
		description:
			"Drop images, documents, and other files directly into any conversation. Everything stays where the conversation happens.",
	},
	{
		title: "Voice Messages",
		description:
			"Record and send voice notes when typing isn't fast enough. Great for quick updates, explanations, or moments when tone matters.",
	},
	{
		title: "Real-Time Messaging",
		description:
			"Messages arrive instantly across all your devices. No delays, no refresh rather just live conversation as it happens.",
	},
];

export { FEATURES, firstTestimonial, secondTestimonial }