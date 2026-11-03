"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION_FAST } from "@/lib/motion";
import { BADGES } from "@/data/badges";

interface BadgeStepProps {
	selectedBadge: string | null;
	onSelectBadge: (badge: string) => void;
}

export function BadgeStep({ selectedBadge, onSelectBadge }: BadgeStepProps) {
	return (
		<div>
			<div
				className="grid grid-cols-4 gap-3 sm:grid-cols-6"
				role="group"
				aria-label="Choose a badge"
			>
				{BADGES.map((badge, index) => {
					const selected = selectedBadge === badge;
					return (
						<button
							key={badge}
							type="button"
							aria-label={`Badge ${index + 1}`}
							aria-pressed={selected}
							onClick={() => onSelectBadge(badge)}
							className={cn(
								"aspect-square overflow-hidden rounded-xl border-2 transition-all duration-150 hover:scale-105",
								selected
									? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
									: "border-border hover:border-accent"
							)}
						>
							<Image
								src={badge}
								alt=""
								width={100}
								height={100}
								className="size-full object-cover"
							/>
						</button>
					);
				})}
			</div>

			<AnimatePresence initial={false}>
				{selectedBadge && (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						transition={{ duration: DURATION_FAST, ease: "easeOut" }}
						className="mt-4 flex items-center gap-3 border-2 border-foreground bg-popover p-3 dark:border-ring"
					>
						<Image
							src={selectedBadge}
							alt="Your chosen badge"
							width={48}
							height={48}
							className="size-12 shrink-0 rounded-lg object-cover"
						/>
						<p className="text-sm leading-relaxed">
							This badge will represent you across OpenChats.
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
