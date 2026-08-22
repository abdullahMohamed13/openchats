import { StepsProps } from "../HowItWorks";

export default function StepsCard({id, label, description}: StepsProps) {
	return <div className="flex flex-col gap-2">
		<div className="flex gap-4 items-center text-muted mb-2">
			<span className="text-4xl font-extrabold text-primary">0{id}</span>
			<span className="block w-full h-0.5 bg-gradient-to-r from-muted to-transparent"/>
		</div>
		
		<h3 className="text-primary font-extrabold">
			{label}
		</h3>

		<div className="text-xs md:text-sm">
			{description}
		</div>
	</div>
}