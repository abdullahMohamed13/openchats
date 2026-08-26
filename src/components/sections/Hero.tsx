"use client"

import "@/styles/parallax.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BrutalButton from "../ui/brutal-button";

export default function HeroSection() {
	const parallaxRef = useRef<HTMLDivElement>(null);

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

		const lenis = new Lenis();
		lenis.on("scroll", ScrollTrigger.update);
		gsap.ticker.add((time) => {
			lenis.raf(time * 1000);
		});
		gsap.ticker.lagSmoothing(0);

		return () => {
			ScrollTrigger.getAll().forEach((st) => st.kill());
			if (triggerElement) gsap.killTweensOf(triggerElement);
			lenis.destroy();
		};
	}, []);

	return (
		<div className="parallax bg-accent!" ref={parallaxRef}>
			<section className="parallax__header">
				<div className="parallax__visuals">
					<div className="parallax__black-line-overflow" />
					<div data-parallax-layers className="parallax__layers">
						<Image
							src="/hero-background.webp"
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
							transition={{ duration: 0.8 }}
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
								<h3 className="capitalize mt-3 md:[&_span]:italic">
									<span>Your team</span> |
									<span>Your conversations</span> |
									<span>One place</span>
								</h3>
							</div>
							<p className="max-w-md text-sm md:text-base text-foreground/80">
								Bring your teams, workspaces, channels, and direct conversations together in one place.
							</p>
							
							<Link href="/signup">
								<BrutalButton className="mt-2">Get Started</BrutalButton>
							</Link>
							
						</motion.div>
						</div>
					</div>
			</section>
		</div>
	);
}
