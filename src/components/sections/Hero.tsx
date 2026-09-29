"use client"

import "@/styles/parallax.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { DURATION_SLOW } from "@/lib/motion";
import { authClient } from "@/lib/auth-client";
import BrutalButton from "../ui/brutal-button";

export default function HeroSection() {
	const parallaxRef = useRef<HTMLDivElement>(null);
	const { data: session, isPending } = authClient.useSession();
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
							data-parallax-layer="1" className="parallax__layer-title flex-col-center gap-4"
						>
							<div className="flex-col-center">
								<Image
									src="/logo.webp"
									alt="OpenChats logo"
									loading="eager"
									width={170}
									height={170}
									draggable={false}
									className="z-2 size-[150px]! lg:size-[170px] object-contain will-change-transform"
								/>
								<h1 className="font-brogetta font-bold text-6xl! md:text-7xl lg:text-8xl! -mt-4">
									OpenChats
								</h1>
							<h3 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 capitalize mt-3 md:[&_span]:italic">
								<span>Your team</span>
								<span aria-hidden className="text-accent select-none">·</span>
								<span>Your conversations</span>
								<span aria-hidden className="text-accent select-none">·</span>
								<span>One place</span>
							</h3>
							</div>
							<p className="max-w-md text-sm md:text-base text-foreground/80">
								Bring your teams, workspaces, channels, and direct conversations together in one place.
							</p>
							
						<Link href={isSignedIn ? "/dashboard" : "/signup"}>
							<BrutalButton className="mt-2">{isSignedIn ? "Go to Dashboard" : "Get Started"}</BrutalButton>
						</Link>
							
						</motion.div>
						</div>
					</div>
			</section>
		</div>
	);
}
