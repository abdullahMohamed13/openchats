import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StepsProps = {
	id: number;
	label: string;
	description: string;
	active?: boolean;
	children?: ReactNode;
};

export default function StepsCard({ id, label, description, active = false, children }: StepsProps) {
	return (
		<div
			className={cn(
				"flex flex-col justify-center border-t-2 border-light-foreground/15 py-10 transition-opacity duration-300 lg:min-h-[65vh] lg:py-16",
				active ? "lg:opacity-100" : "lg:opacity-40",
			)}
		>
			<span
				className={cn(
					"font-press-start text-3xl transition-colors duration-300 md:text-4xl",
					active ? "text-primary" : "text-light-foreground/25",
				)}
			>
				0{id}
			</span>

			<h3 className="mt-5 text-xl font-bold md:text-2xl">{label}</h3>

			<p className="font-quera mt-3 max-w-sm text-sm leading-relaxed text-light-foreground/70 md:text-base">
				{description}
			</p>

			{children && <div className="mt-8 lg:hidden">{children}</div>}
		</div>
	);
}
