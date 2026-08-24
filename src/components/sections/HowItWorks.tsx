import { Line } from "../shared/Line"
import { MotionWrapper } from "../shared/MotionWrapper"
import StepsCard from "./reusable/StepsCard"

export interface StepsProps {
	id: number,
	label: string,
	description: string
}

const steps: StepsProps[] = [
	{
		id: 1,
		label: 'Create Your Workspace',
		description: "Set up a dedicated home for your team, club, or community in seconds."
	},
	{
		id: 2,
		label: 'Invite Your People',
		description: "Share an invite link and bring everyone on board, no setup required."
	},
	{
		id: 3,
		label: 'Start Conversations',
		description: "Organize discussions into channels, message directly, and share files in real time."
	},
]

export default function HowItWorks() {
	return <MotionWrapper
			initial={{ opacity: 0 }}
			animate={{opacity: 1}}
		>
			<section className="section-padding">
				<div className="mb-4 font-bold flex flex-col items-center md:items-start">
					<p className="text-2xl font-quera">How It Works</p>
					<Line className="-mt-5 rotate-179" />
		
					<p className="-mt-2 text-4xl capitalize text-center md:text-left">Getting started is simple.</p>
				</div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-around">
					{steps.map((step: StepsProps) => (
						<StepsCard key={step.id} id={step.id} label={step.label} description={step.description} />
					))}
				</div>
			</section>
		</MotionWrapper>
}