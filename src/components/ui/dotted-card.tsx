"use client";

import { cn } from "../../../lib/utils";

interface CardProp {
	children: React.ReactNode;
	className?: string;
}
export default function Card({children, className}: CardProp) {
	return <div className={cn("border border-dotted bg-transparent", className)}>
		{children}
	</div>
}