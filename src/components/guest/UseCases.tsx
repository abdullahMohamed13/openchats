"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION_MID } from "@/lib/motion";
import SectionHeader from "../shared/SectionHeader";
import { USE_CASES } from "@/data/use-cases";

const ROTATE_INTERVAL = 4;

export default function UseCases() {
	const gridRef = useRef<HTMLDivElement>(null);
	const inView = useInView(gridRef, { amount: 0.4 });
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);

	const current = USE_CASES[active];
	const idle = !inView || paused;

	const handleProgressEnd = () => {
		if (idle) return;
		setActive((index) => (index + 1) % USE_CASES.length);
	};

	return (
		<section id="use-cases" className="section-padding scroll-mt-14">
			<SectionHeader label="Use Cases" title="Built for how you work" lineWidth={129} lineClassName="-mt-5 md:-translate-x-2.5" />

			<div
				ref={gridRef}
				className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-10 items-center"
				onMouseEnter={() => setPaused(true)}
				onMouseLeave={() => setPaused(false)}
			>
				<div className="flex flex-col overflow-hidden" role="group" aria-label="Use cases">
					{USE_CASES.map((useCase, index) => {
						const isActive = index === active;
						return (
							<button
								key={useCase.title}
								type="button"
								onClick={() => setActive(index)}
								aria-label={`Show ${useCase.title} use case`}
								aria-current={isActive || undefined}
								className="group block w-full overflow-hidden border-b border-foreground/10 pt-2 md:pt-3 text-left cursor-pointer"
							>
								<span
									className={cn(
										"block font-press-start text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight translate-y-[15%] transition-all duration-300 group-hover:translate-y-0 group-hover:font-bold group-focus-visible:translate-y-0 group-focus-visible:font-bold",
										isActive ? "text-foreground" : "text-foreground/20 group-hover:text-foreground group-focus-visible:text-foreground",
									)}
								>
									{useCase.title}
								</span>
							</button>
						);
					})}
				</div>

				<div aria-live="polite" className="w-full">
					<AnimatePresence mode="wait">
						<motion.div
							key={active}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -12 }}
							transition={{ duration: DURATION_MID, ease: "easeInOut" }}
						>
							<h3 className="font-press-start text-xl md:text-2xl text-primary">{current.heading}</h3>
							<p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
								{current.description}
							</p>
						</motion.div>
					</AnimatePresence>

					<div className="relative mt-8 h-px max-w-md overflow-hidden bg-foreground/10">
						<span
							key={active}
							onAnimationEnd={handleProgressEnd}
							className="absolute inset-0 bg-accent origin-left"
							style={{
								animation: `useCaseProgress ${ROTATE_INTERVAL}s linear forwards`,
								animationPlayState: idle ? "paused" : "running",
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
