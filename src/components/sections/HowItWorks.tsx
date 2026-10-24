"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION_MID } from "@/lib/motion";
import { useSmoothScroll } from "@/providers/SmoothScrollProvider";
import SectionHeader from "../shared/SectionHeader";
import StepsCard from "./reusable/StepsCard";
import StepVisual from "./reusable/StepVisual";
import { STEPS } from "@/data/how-it-works";

export default function HowItWorks() {
	const [active, setActive] = useState(0);
	const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
	const { scrollTo } = useSmoothScroll();

	useEffect(() => {
		let frame = 0;

		const update = () => {
			frame = 0;
			const center = window.innerHeight / 2;
			let next = 0;
			let closest = Number.POSITIVE_INFINITY;

			stepRefs.current.forEach((el, index) => {
				if (!el) return;
				const rect = el.getBoundingClientRect();
				const distance =
					rect.top > center ? rect.top - center : rect.bottom < center ? center - rect.bottom : 0;
				if (distance < closest) {
					closest = distance;
					next = index;
				}
			});

			setActive((current) => (current === next ? current : next));
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, []);

	const activeStep = STEPS[active];

	const goToStep = useCallback(
		(index: number) => {
			const el = stepRefs.current[index];
			if (el) scrollTo(el);
		},
		[scrollTo],
	);

	return (
		<section
			id="how-it-works"
			className="section-padding scroll-mt-14 bg-light text-light-foreground [overflow-anchor:none]"
		>
			<SectionHeader label="How It Works" title="Getting started is simple" lineWidth={132} lineClassName="-mt-5 md:-translate-x-1" />

			<div className="mt-6 grid grid-cols-1 lg:mt-2 lg:grid-cols-2 lg:gap-16">
				<div className="flex flex-col">
					{STEPS.map((step, index) => (
						<div
							key={step.id}
							ref={(el) => {
								stepRefs.current[index] = el;
							}}
						>
							<StepsCard id={step.id} label={step.label} description={step.description} active={index === active}>
								<div className="border-2 border-black bg-background text-foreground shadow-[4px_4px_0_0_var(--primary)]">
									<div className="px-5 py-5">
										<StepVisual id={step.id} />
									</div>
								</div>
							</StepsCard>
						</div>
					))}
				</div>

				<div className="hidden lg:block">
					<div className="sticky top-[calc(var(--nav-height)+2rem)]">
						<div className="border-2 border-black bg-background text-foreground shadow-[6px_6px_0_0_var(--primary)]">
							<div className="flex items-center gap-2 border-b-2 border-black bg-foreground px-4 py-2.5 text-black">
								<span aria-hidden className="size-2.5 bg-primary" />
								<span aria-hidden className="size-2.5 bg-accent" />
								<span aria-hidden className="size-2.5 bg-black" />
								<span className="ml-auto font-quera text-[10px] uppercase tracking-[0.18em] text-black/60">
									0{activeStep.id} / 0{STEPS.length}
								</span>
							</div>

							<div className="min-h-[340px] px-5 py-6 md:px-6">
								<motion.div
									key={activeStep.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: DURATION_MID, ease: "easeInOut" }}
								>
									<StepVisual id={activeStep.id} />
								</motion.div>
							</div>

							<div className="flex gap-1.5 border-t-2 border-black bg-foreground p-2">
								{STEPS.map((step, index) => (
									<button
										key={step.id}
										type="button"
										onClick={() => goToStep(index)}
										aria-label={`Go to step ${step.id}: ${step.label}`}
										aria-current={index === active ? "step" : undefined}
										className="group flex-1 cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
									>
										<span
											className={cn(
												"block h-1.5 w-full transition-colors duration-300",
												index === active ? "bg-primary" : "bg-black/15 group-hover:bg-black/35",
											)}
										/>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
