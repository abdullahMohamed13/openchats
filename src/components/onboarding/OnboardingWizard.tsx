"use client";

import { useState, useSyncExternalStore } from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
	ArrowLeft,
	ArrowRight,
	Info,
	Phone,
	User,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import BrutalButton from "@/components/ui/brutal-button";
import { Progress } from "@/components/ui/8bit/progress";
import { Input } from "@/components/ui/8bit/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu";

import { AVATARS } from "../../data/avatars";
import { BADGES } from "../../data/badges";

type Gender = "" | "male" | "female";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,14}$/;

const STEPS = [
	{ title: "Username", subtitle: "What should we call you?" },
	{ title: "Phone", subtitle: "How can we reach you?" },
	{ title: "Avatar", subtitle: "Make it yours, pick an avatar you like" },
	{ title: "Badge", subtitle: "Pick a badge that represents you" },
] as const;

export default function OnboardingWizard() {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [username, setUsername] = useState("");
	const [phone, setPhone] = useState("");
	const [gender, setGender] = useState<Gender>("");
	const [selectedAvatar, setSelectedAvatar] = useState<StaticImageData | null>(null);
	const [selectedBadge, setSelectedBadge] = useState<StaticImageData | null>(null);
	const [previewing, setPreviewing] = useState(false);
	const [phoneInfoOpen, setPhoneInfoOpen] = useState(false);

	function subscribeToHover(onStoreChange: () => void) {
		const hoverQuery = window.matchMedia("(hover: hover)");
		hoverQuery.addEventListener("change", onStoreChange);
		return () => hoverQuery.removeEventListener("change", onStoreChange);
	}

	const canHover = useSyncExternalStore(
		subscribeToHover,
		() => window.matchMedia("(hover: hover)").matches,
		() => true
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const avatars =
		gender === "male" ? AVATARS.male : gender === "female" ? AVATARS.female : [];

	const canProceed =
		step === 0
			? USERNAME_PATTERN.test(username.trim())
			: step === 1
				? PHONE_PATTERN.test(phone.trim())
				: step === 2
					? gender !== "" && selectedAvatar !== null
					: selectedBadge !== null;

	const progressValue = Math.round(
		([
			USERNAME_PATTERN.test(username.trim()),
			PHONE_PATTERN.test(phone.trim()),
			gender !== "" && selectedAvatar !== null,
			selectedBadge !== null,
		].filter(Boolean).length /
			STEPS.length) *
			100
	);

	const handleGenderChange = (value: Gender) => {
		setGender(value);
		setSelectedAvatar(null);
		setPreviewing(false);
	};

	const goNext = () => {
		if (!canProceed) return;
		setError(null);
		setStep((current) => Math.min(current + 1, STEPS.length - 1));
	};

	const goBack = () => {
		setError(null);
		setStep((current) => Math.max(current - 1, 0));
	};

	const handleFinish = async () => {
		if (!selectedAvatar || !selectedBadge || saving) return;
		setSaving(true);
		setError(null);

		const { error: updateError } = await authClient.updateUser({
			name: username.trim(),
			image: selectedAvatar.src,
			phone: phone.trim(),
			gender,
			badge: selectedBadge.src,
		});

		if (updateError) {
			setError(updateError.message ?? "Something went wrong. Please try again.");
			setSaving(false);
			return;
		}

		router.push("/onboarding");
	};

	const currentStep = STEPS[step];

	return (
		<div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-shadow sm:p-8">
			<header className="mb-8 text-center">
				<h1 className="font-press-start text-xl leading-relaxed  uppercase">
					Set up your profile
				</h1>
			</header>

			<div className="mb-8">
				<div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
					<span>Your progress</span>
					<span aria-hidden>{progressValue}%</span>
				</div>
					<div className="relative">
						<Progress value={progressValue} className="h-4" aria-label="Onboarding progress" />
						<AnimatePresence initial={false}>
							{progressValue === 100 && (
								<motion.span
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									className="animate-pulse retro flex-center pointer-events-none absolute inset-0 text-[8px] tracking-wider "
								>
									LEVEL UP!
								</motion.span>
							)}
						</AnimatePresence>
					</div>
			</div>

			<div className="mb-6">
				<h2 className="font-press-start text-sm leading-relaxed text-accent">
					{currentStep.subtitle}
				</h2>
			</div>

			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={step}
					initial={{ opacity: 0, x: 32 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -32 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
				>
					{step === 0 && (
						<div>
							<label htmlFor="username" className="mb-2 block text-sm ">
								Username
							</label>
							<div className="relative">
								<User
									size={16}
									className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value.toLowerCase())}
									placeholder="e.g. hysm_67"
									autoComplete="off"
									spellCheck={false}
									maxLength={20}
									className="h-12 pl-9 "
								/>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">
								3–20 characters. Small letters only, numbers, dots and underscores.
							</p>
						</div>
					)}

					{step === 1 && (
						<div>
							<label htmlFor="phone" className="mb-2 block text-sm ">
								Phone number
							</label>
							<div className="relative">
								<Phone
									size={16}
									className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="phone"
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+20 100 123 4567"
									autoComplete="tel"
									className="h-12 pl-9 "
								/>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">
								Include your country code, e.g. +20 for Egypt.
							</p>
							<div className="mt-1">
							<span
								tabIndex={0}
								role="note"
								aria-label="Why do we need your phone number?"
								onClick={() => {
									if (!canHover) setPhoneInfoOpen(true);
								}}
								className="group relative inline-flex cursor-help items-center gap-1.5 outline-none"
							>
								<Info size={14} className="shrink-0 text-accent" />
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
						</div>

							<AnimatePresence>
								{!canHover && phoneInfoOpen && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
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
					)}

					{step === 2 && (
						<div>
							<label htmlFor="gender" className="mb-2 block text-sm ">
								Gender
							</label>
							<DropdownMenu>
								<DropdownMenuTrigger
									id="gender"
									className={cn(
										"retro h-12 w-full rounded-none border-2 border-foreground bg-popover px-4 text-left text-xs outline-none transition-all dark:border-ring",
										"focus-visible:border-accent focus-visible:shadow-[3px_3px_0px_var(--accent)] data-popup-open:border-accent data-popup-open:shadow-[3px_3px_0px_var(--accent)]",
										gender ? "" : "text-muted-foreground"
									)}
								>
									{gender === "male" ? "Male" : gender === "female" ? "Female" : "Select your gender"}
								</DropdownMenuTrigger>
								<DropdownMenuContent aria-label="Gender options">
									<DropdownMenuItem
										className={cn(gender === "male" && "text-accent")}
										onClick={() => handleGenderChange("male")}
									>
										Male
									</DropdownMenuItem>
									<DropdownMenuItem
										className={cn(gender === "female" && "text-accent")}
										onClick={() => handleGenderChange("female")}
									>
										Female
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<AnimatePresence mode="wait" initial={false}>
								{gender && (
									<motion.div
										key={gender}
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25, ease: "easeOut" }}
										className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-5"
										role="group"
										aria-label={`Choose an avatar (${gender})`}
									>
										{avatars.map((avatar, index) => {
											const selected = selectedAvatar?.src === avatar.src;
											return (
												<button
													key={avatar.src}
													type="button"
													aria-label={`Avatar ${index + 1}`}
													aria-pressed={selected}
													onClick={() => setSelectedAvatar(avatar)}
													className={cn(
														"aspect-square overflow-hidden rounded-full border-2 transition-all duration-150 hover:scale-105",
														selected
															? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
															: "border-border hover:border-accent"
													)}
												>
													<Image
														src={avatar}
														alt=""
														className="size-full object-cover"
													/>
												</button>
											);
										})}
									</motion.div>
								)}
							</AnimatePresence>

							<div className="mt-3 flex justify-end">
								<BrutalButton
									type="button"
									onClick={() => setPreviewing((open) => !open)}
									disabled={!selectedAvatar}
									color="var(--muted)"
									textColor="var(--foreground)"
									borderColor="var(--border)"
									shadowColor="var(--border)"
									className="gap-2 px-3 py-1.5 text-xs! disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
								>
									{previewing ? "Close preview" : "Preview"}
								</BrutalButton>
							</div>

							<AnimatePresence initial={false}>
								{previewing && selectedAvatar && (
									<motion.div
										initial={{ opacity: 0, y: 12, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 8, scale: 0.97 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
										className="mt-4 border-2 border-foreground bg-popover p-4 dark:border-ring"
									>
										<div className="flex items-center gap-4">
											<Image
												src={selectedAvatar}
												alt="Preview of your chosen avatar"
												className="size-35 shrink-0 rounded-full object-cover"
											/>
											<div className="retro truncate text-sm  min-w-0">
												{username.trim()}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}

					{step === 3 && (
						<div>
							<div
								className="grid grid-cols-4 gap-3 sm:grid-cols-6"
								role="group"
								aria-label="Choose a badge"
							>
								{BADGES.map((badge, index) => {
									const selected = selectedBadge?.src === badge.src;
									return (
										<button
											key={badge.src}
											type="button"
											aria-label={`Badge ${index + 1}`}
											aria-pressed={selected}
											onClick={() => setSelectedBadge(badge)}
											className={cn(
												"aspect-square overflow-hidden rounded-xl border-2 transition-all duration-150 hover:scale-105",
												selected
													? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
													: "border-border hover:border-accent"
											)}
										>
											<Image
												src={badge}
												alt=""
												className="size-full object-cover"
											/>
										</button>
									);
								})}
							</div>

							<AnimatePresence initial={false}>
								{selectedBadge && (
									<motion.div
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 8 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
										className="mt-4 flex items-center gap-3 border-2 border-foreground bg-popover p-3 dark:border-ring"
									>
										<Image
											src={selectedBadge}
											alt="Your chosen badge"
											className="size-12 shrink-0 rounded-lg object-cover"
										/>
										<p className="text-sm leading-relaxed">
											This badge will represent you across OpenChats.
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}
				</motion.div>
			</AnimatePresence>

			{error && (
				<p role="alert" className="mt-4 text-sm text-danger">
					{error}
				</p>
			)}

			<div className="mt-8 flex items-center justify-between gap-3">
				{step > 0 ? (
					<BrutalButton
						type="button"
						onClick={goBack}
						color="var(--muted)"
						textColor="var(--muted-foreground)"
						borderColor="var(--border)"
						shadowColor="var(--border)"
						className="gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
					>
						<ArrowLeft size={16} />
						Back
					</BrutalButton>
				) : (
					<span />
				)}

				<BrutalButton
					type="button"
					onClick={step === STEPS.length - 1 ? handleFinish : goNext}
					disabled={!canProceed || saving}
					color="var(--primary)"
					textColor="var(--foreground)"
					borderColor="var(--foreground)"
					className="gap-2 px-5 py-2 uppercase tracking-wider text-sm! disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
				>
					{step === STEPS.length - 1 ? (saving ? "Saving..." : "Finish") : "Continue"}
					{step !== STEPS.length - 1 && <ArrowRight size={16} />}
				</BrutalButton>
			</div>
		</div>
	);
}
