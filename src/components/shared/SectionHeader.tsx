import { cn } from "@/lib/utils";
import { Line } from "./Line";

type SectionHeaderProps = {
	label: string;
	title: string;
	lineWidth?: number;
	lineClassName?: string;
	showLine?: boolean;
};

export default function SectionHeader({ label, title, lineWidth = 65, lineClassName, showLine = true }: SectionHeaderProps) {
	return (
		<div className="mb-4 font-bold flex flex-col items-center md:items-start">
			<p className="text-2xl font-quera">{label}</p>
			{showLine && (
				<Line className={cn("-mt-4 rotate-179 md:-translate-x-3", lineClassName)} width={lineWidth} />
			)}
			<p className={`${showLine ? "-mt-2" : "mt-1"} text-3xl md:text-4xl capitalize text-center md:text-left`}>{title}</p>
		</div>
	);
}
