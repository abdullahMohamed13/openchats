import { Line } from "../shared/Line"
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
		description: "Sign up and set up your team's workspace in seconds."
	},
	{
		id: 2,
		label: 'Invite Your Team',
		description: "Share a link and start bringing your teammates on board."
	},
	{
		id: 3,
		label: 'Start Conversations',
		description: "Create channels, send messages, and collaborate in real time."
	},
]

export default function HowItWorks() {
	return <div className="section-padding">
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
	</div>
}