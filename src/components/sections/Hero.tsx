"use client"

import "@/styles/parallax.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Users } from "pixelarticons/react";
import { DURATION_SLOW } from "@/lib/motion";
import { authClient } from "@/lib/auth-client";
import { useSmoothScroll } from "@/providers/SmoothScrollProvider";
import BrutalButton from "../ui/brutal-button";

export default function HeroSection() {
	const parallaxRef = useRef<HTMLDivElement>(null);
	const { data: session, isPending } = authClient.useSession();
	const { scrollTo } = useSmoothScroll();
	const isSignedIn = !isPending && !!session;

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const triggerElement = parallaxRef.current?.querySelector("[data-parallax-layers]");

		if (triggerElement) {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: triggerElement,
					start: "0% 0%",
					end: "100% 0%",
					scrub: 1,
				},
			});

			const layers = [
				{ layer: "1", yPercent: 70 },
				{ layer: "4", yPercent: 10 },
			];

			layers.forEach((layerObj, idx) => {
				tl.to(
					triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
					{
						yPercent: layerObj.yPercent,
						ease: "none",
					},
					idx === 0 ? undefined : "<",
				);
			});
		}

		return () => {
			ScrollTrigger.getAll().forEach((st) => st.kill());
			if (triggerElement) gsap.killTweensOf(triggerElement);
		};
	}, []);

	return (
		<div className="parallax bg-accent!" ref={parallaxRef}>
			<section className="parallax__header">
				<div className="parallax__visuals">
					<div className="parallax__black-line-overflow" />
					<div data-parallax-layers className="parallax__layers">
						<Image
							src="/images/backgrounds/hero-background.webp"
							alt="Background Image"
							loading="eager"
							width={1920}
							height={1080}
							draggable={false}
							data-parallax-layer="4"
							className="parallax__layer-img"
						/>

						<div className="parallax__fade" />

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: DURATION_SLOW }}
							data-parallax-layer="1" className="parallax__layer-title flex-col-center gap-4 w-full"
						>
							<div className="flex w-[96%] flex-col items-center gap-3 px-5 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
								<Image
									src="/logo-alt.webp"
									alt="OpenChats logo"
									loading="eager"
									width={260}
									height={260}
									draggable={false}
									className="z-2 size-[150px]! lg:size-[320px]! object-contain will-change-transform lg:order-2 lg:[mask-image:linear-gradient(to_right,transparent,black_20%)]"
							/>
								
							<div className="flex-col-center lg:order-1 lg:items-start lg:justify-start lg:text-left">
								<p className="inline-flex items-center gap-2.5 border-2 border-black bg-foreground py-1.5 pr-3.5 pl-1.5 font-quera text-[10px] uppercase tracking-[0.18em] text-black/80 shadow-[3px_3px_0_0_var(--accent)] md:text-[11px]">
									<span aria-hidden className="flex size-5 items-center justify-center bg-primary text-foreground">
										<Users width={12} height={12} />
									</span>
									For teams, clubs &amp; communities
								</p>

								<h2 className="mt-3 font-press-start text-lg leading-[1.2] font-bold sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
									<span className="block text-foreground">Team conversations</span>
									<span className="block text-accent">finally organized</span>
								</h2>

								<p className="font-quera mt-5 max-w-md text-center text-sm leading-relaxed text-foreground/75 md:text-base lg:text-left">
									Channels for projects, DMs for quick questions, and files that stay where the conversation happens. Everything searchable, everything out of email.
								</p>

								<div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
									<Link href={isSignedIn ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
										<BrutalButton className="w-full sm:w-auto">{isSignedIn ? "Go to Dashboard" : "Start Chatting"}</BrutalButton>
									</Link>

									<a
										href="#how-it-works"
										onClick={(e) => {
											e.preventDefault();
											scrollTo("#how-it-works");
											history.replaceState(null, "", "#how-it-works");
										}}
										className="group inline-flex w-full items-center justify-center gap-2 border-2 border-foreground px-6 py-3 font-bold transition-colors duration-200 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:w-auto"
									>
										See how it works
										<span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
											↓
										</span>
									</a>
								</div>
							</div>
							</div>
						</motion.div>
						</div>
					</div>
			</section>
		</div>
	);
}
