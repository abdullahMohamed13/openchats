"use client"

import Link from "next/link";
import BrutalButton from "../ui/brutal-button";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
	
	return <motion.section
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1, ease: "easeInOut" }}
			className="min-h-screen flex-col-center section-padding text-center"
			style={{
				background: "linear-gradient(rgba(18, 98, 58, 0.85), rgba(18, 98, 58, 0.90)), url('/hero-background.webp')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<Image src="/logo.webp" width={150} height={150} alt="Logo" loading="eager" />
			<div className="font-brogetta flex-col-center mb-4">
				<h1 className=" font-bold text-6xl! md:text-7xl lg:text-8xl!">OpenChats</h1>
		
				<h3 className="md:italic capitalize mt-2">Your team | Your conversations | One place.</h3>
			</div>
			<p>Bring your teams, workspaces, channels, and direct conversations together in one place.</p>
	
			<Link href='/signup'>
				<BrutalButton className="mt-5">
					Get Started
				</BrutalButton>
			</Link>

		</motion.section>
}
