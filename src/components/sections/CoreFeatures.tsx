"use client";

import SectionHeader from "../shared/SectionHeader";
import InfoCard from "../shared/InfoCard";
import TestimonialCard from "./reusable/TestimonialCard";
import { motion } from "framer-motion";
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

const features = [
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

export default function Features() {
	return (
		<section
			className="min-h-screen flex-col-center border-y-3 md:border-y-6 border-secondary overflow-x-clip"
			style={{
				background:
					"linear-gradient(rgba(18, 98, 58, 0.87), rgba(18, 98, 58, 0.95)), url('/features-image.webp')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<div className="section-padding w-full">
				<SectionHeader label="Features" title="Everything you need to communicate" showLine={false} />

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
					<motion.div
						initial={{ opacity: 0, x: -60 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: false, amount: 0.3 }}
						transition={{ duration: 0.8, ease: "easeInOut" }}
						className="lg:col-span-2 h-full"
					>
						<TestimonialCard {...firstTestimonial} />
					</motion.div>

					{features.map((feature) => (
						<InfoCard key={feature.title} title={feature.title} description={feature.description} />
					))}

					<motion.div
						initial={{ opacity: 0, x: 60 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: false, amount: 0.3 }}
						transition={{ duration: 0.8, ease: "easeInOut" }}
						className="lg:col-span-2 h-full"
					>
						<TestimonialCard {...secondTestimonial} />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
