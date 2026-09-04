"use client";

import { useSyncExternalStore, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DURATION_FAST } from "@/lib/motion";
import { CircleInfo } from "pixelarticons/react";
import BrutalButton from "@/components/ui/brutal-button";
import PhoneInput from "./PhoneInput";
import type { CountryCode } from "libphonenumber-js/max";

type PhoneStepProps = {
	value: string;
	onChange: (value: string) => void;
	country: CountryCode;
	onChangeCountry: (value: CountryCode) => void;
	onProceed: () => void;
	onError: (error: string | null) => void;
};

function subscribeToHover(onStoreChange: () => void) {
	const hoverQuery = window.matchMedia("(hover: hover)");
	hoverQuery.addEventListener("change", onStoreChange);
	return () => hoverQuery.removeEventListener("change", onStoreChange);
}

export default function PhoneStep({
	value,
	onChange,
	country,
	onChangeCountry,
	onProceed,
	onError,
}: PhoneStepProps) {
	const canHover = useSyncExternalStore(
		subscribeToHover,
		() => window.matchMedia("(hover: hover)").matches,
		() => true
	);
	const [phoneInfoOpen, setPhoneInfoOpen] = useState(false);

	return (
		<div>
			<label htmlFor="phone" className="mb-2 block text-sm ">
				Phone number
			</label>
			<PhoneInput
				id="phone"
				value={value}
				onChange={onChange}
				country={country}
				onChangeCountry={onChangeCountry}
				placeholder="e.g. 101 234 5678 for Egypt"
				autoComplete="tel"
				className="h-12 rounded-none"
			/>
			<p className="mt-2 text-xs text-muted-foreground">
				Enter your full number for the selected country.
			</p>
			<div className="mt-1 flex items-center justify-between">
				<span
					tabIndex={0}
					role="note"
					aria-label="Why do we need your phone number?"
					onClick={() => {
						if (!canHover) setPhoneInfoOpen(true);
					}}
					className="group relative inline-flex cursor-help items-center gap-1.5 outline-none"
				>
					<CircleInfo width={14} height={14} className="shrink-0 text-accent" />
					<span className="text-xs text-accent underline transition-colors group-hover:text-foreground group-focus-visible:text-foreground">
						Why do we need this?
					</span>
					{canHover && (
						<span
							aria-hidden
							className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-60 rounded-lg border border-border bg-muted p-2.5 text-left text-xs leading-relaxed text-foreground opacity-0 shadow-shadow transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
						>
							We&apos;ll use this in future features such as WhatsApp notifications.
						</span>
					)}
				</span>
				<button
					type="button"
					className="text-xs text-muted-foreground underline transition-colors hover:text-foreground"
					onClick={() => {
						onChange("");
						onError(null);
						onProceed();
					}}
				>
					Skip phone number for now
				</button>
			</div>

			<AnimatePresence>
				{!canHover && phoneInfoOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: DURATION_FAST, ease: "easeOut" }}
						className="fixed inset-0 z-50 flex-center px-6"
						role="dialog"
						aria-modal="true"
						aria-label="Why do we need your phone number?"
					>
						<button
							aria-label="Close"
							className="absolute inset-0 cursor-default bg-background/70"
							onClick={() => setPhoneInfoOpen(false)}
						/>
						<div className="relative w-full max-w-xs border-2 border-foreground bg-popover p-4 dark:border-ring">
							<p className="text-sm leading-relaxed text-foreground">
								We&apos;ll use this in future features such as WhatsApp notifications.
							</p>
							<BrutalButton
								type="button"
								onClick={() => setPhoneInfoOpen(false)}
								color="var(--primary)"
								textColor="var(--foreground)"
								borderColor="var(--foreground)"
								className="mt-4 w-full py-2 text-xs uppercase tracking-wider"
							>
								Got it
							</BrutalButton>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}