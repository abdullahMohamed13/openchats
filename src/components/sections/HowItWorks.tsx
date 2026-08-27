import { MotionWrapper } from "../shared/MotionWrapper"
import SectionHeader from "../shared/SectionHeader"
import StepsCard from "./reusable/StepsCard"
import { STEPS } from "@/data/how-it-works"

export default function HowItWorks() {
	return <MotionWrapper
			initial={{ opacity: 0 }}
			animate={{opacity: 1}}
		>
			<section className="section-padding">
				<SectionHeader label="How It Works" title="Getting started is simple" lineWidth={132} lineClassName="-mt-5 md:-translate-x-1" />
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-around">
					{STEPS.map((step) => (
						<StepsCard key={step.id} id={step.id} label={step.label} description={step.description} />
					))}
				</div>
			</section>
		</MotionWrapper>
}