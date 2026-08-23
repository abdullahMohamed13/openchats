"use client";

import { AnimationProps } from "@/types/animation-props";
import { motion } from "framer-motion";

export function MotionButton({ children,} : AnimationProps) {
	return (
		<motion.button
			whileHover={{ scale: 1.05, y: -2}}
			whileTap={{ scale: 0.9, y: 1}}
			transition={{ stiffness: 300, type: "spring", damping: 15}}
		>
			{children}
		</motion.button>
	);
}