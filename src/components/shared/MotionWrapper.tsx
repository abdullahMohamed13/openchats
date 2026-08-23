"use client";

import { motion } from "framer-motion";
import { AnimationProps } from "@/types/animation-props";

export function MotionWrapper({ children, initial, animate, transition, ...props} : AnimationProps) {
	return (
		<motion.div
			initial={initial}
			animate={animate}
			transition={{ ...transition, ease: "easeIn" }}
			layout
			{...props}
		>
			{children}
		</motion.div>
	);
}