"use client";

import SectionHeader from "../shared/SectionHeader";
import InfoCard from "../shared/InfoCard";
import TestimonialCard from "./reusable/TestimonialCard";
import { motion } from "framer-motion";
import { DURATION_SLOW } from "@/lib/motion";
import { FEATURES, firstTestimonial, secondTestimonial } from "@/data/features";

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
						transition={{ duration: DURATION_SLOW, ease: "easeInOut" }}
						className="lg:col-span-2 h-full"
					>
						<TestimonialCard {...firstTestimonial} />
					</motion.div>

					{FEATURES.map((feature) => (
						<InfoCard key={feature.title} title={feature.title} description={feature.description} />
					))}

					<motion.div
						initial={{ opacity: 0, x: 60 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: false, amount: 0.3 }}
						transition={{ duration: DURATION_SLOW, ease: "easeInOut" }}
						className="lg:col-span-2 h-full"
					>
						<TestimonialCard {...secondTestimonial} />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
