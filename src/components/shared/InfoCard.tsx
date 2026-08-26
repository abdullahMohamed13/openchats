import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfoCardProps = {
	title: string;
	description?: string;
	children?: ReactNode;
	className?: string;
};

export default function InfoCard({ title, description, children, className }: InfoCardProps) {
	return (
		<div
			className={cn(
				"rounded-base border-2 border-foreground/10 shadow-shadow bg-card p-6 md:p-8 flex flex-col gap-3",
				className,
			)}
		>
			<h3 className="text-xl md:text-2xl font-bold text-foreground">
				{title}
			</h3>
			{description && (
				<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
					{description}
				</p>
			)}
			{children}
		</div>
	);
}
