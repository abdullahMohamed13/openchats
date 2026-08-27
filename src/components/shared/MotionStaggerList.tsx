"use client"
import { motion, type Variants } from "framer-motion"
import { DURATION_SLOW } from "@/lib/motion"

const container: Variants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15, delayChildren: 0.5 }
	}
}

const child: Variants = {
	hidden: {
		opacity: 0, y: 20,
	},
	visible: {
		opacity: 1, y: 0,
		transition: { duration: DURATION_SLOW, ease: "easeIn" }
	}
}

export default function MotionStaggerList({arr} : { arr: string[]}) {
	return <motion.ul variants={container} initial="hidden" animate="visible">
		{arr.map((item, index) => {
			return <motion.li variants={child} key={index}>
				{item}
			</motion.li>
		})}
	</motion.ul>
}