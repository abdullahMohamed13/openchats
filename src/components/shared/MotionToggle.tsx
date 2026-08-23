"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookCallButton } from "@/components/ui/button-call";

export function MotionToggle({ first, second }: { first: string; second: string }) {
	const [active, setActive] = useState(first);

	return (
		<AnimatePresence mode="wait">
			<motion.button
				key={active}
				onClick={() => setActive(active === first ? second : first)}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				transition={{ duration: 0.2 }}
				className="capitalize"
			>
				<BookCallButton>
					{active}
				</BookCallButton>
			</motion.button>
		</AnimatePresence>
	);
}
