"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { claimUsername } from "@/lib/claim-username";
import { checkUsername } from "@/lib/is-username-taken";
import { DURATION_FAST } from "@/lib/motion";
import { STEPS, type Role } from "@/data/onboarding";
import { USERNAME_PATTERN } from "@/lib/username-pattern";
import { Button } from "@/components/ui/8bit/button";
import { Progress } from "@/components/ui/8bit/progress";
import arrowIcon from "@/assets/icons/arrow.webp";
import { BadgeStep } from "./steps/BadgeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { UsernameStep, type UsernameStatus } from "./steps/UsernameStep";

const PENDING_INVITE_KEY = "openchats:pendingInvite";

function nextDestination(): string {
	const pending = window.localStorage.getItem(PENDING_INVITE_KEY);
	return pending ? `/invite/${pending}` : "/chat";
}

const suggestUsername = (name?: string | null): string => {
	if (!name) return "";
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_.]/g, "")
		.slice(0, 20);
};

interface OnboardingFlowProps {
	userId: string;
	initialName: string | null | undefined;
}

export function OnboardingFlow({ userId, initialName }: OnboardingFlowProps) {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [username, setUsername] = useState<string>(() => suggestUsername(initialName));
	const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(() =>
		USERNAME_PATTERN.test(suggestUsername(initialName)) ? "checking" : "idle"
	);
	const [role, setRole] = useState<Role | "">("");
	const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
	const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
	const [previewing, setPreviewing] = useState(false);

	const [saving, setSaving] = useState(false);
	const [checkingUsername, setCheckingUsername] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const usernameValid = USERNAME_PATTERN.test(username.trim());

	useEffect(() => {
		if (!usernameValid) return;
		let cancelled = false;
		const timer = setTimeout(async () => {
			const availability = await checkUsername(username.trim(), userId);
			if (!cancelled) setUsernameStatus(availability);
		}, 350);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [usernameValid, username, userId]);

	const canProceed =
		step === 0
			? usernameValid && usernameStatus === "available"
			: step === 1
				? role !== "" && selectedAvatar !== null
				: selectedBadge !== null;

	const progressValue = Math.round(
		([
			usernameValid,
			role !== "" && selectedAvatar !== null,
			selectedBadge !== null,
		].filter(Boolean).length /
			STEPS.length) *
			100
	);

	const handleUsernameChange = (value: string) => {
		const next = value.toLowerCase();
		setUsername(next);
		setUsernameStatus(
			USERNAME_PATTERN.test(next.trim()) ? "checking" : "idle"
		);
		setError(null);
	};

	const handleRoleChange = (value: Role) => {
		setRole(value);
		setPreviewing(false);
	};

	const goNext = async () => {
		if (!canProceed || checkingUsername) return;
		setError(null);

		if (step === 0) {
			setCheckingUsername(true);
			const claim = await claimUsername(username.trim(), userId);
			setCheckingUsername(false);

			if (!claim.ok) {
				setUsernameStatus(claim.reason);
				return;
			}
			setUsernameStatus("available");
		}

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

		const claim = await claimUsername(username.trim(), userId);
		if (!claim.ok) {
			setError("This username is already taken. Try another one.");
			setSaving(false);
			setStep(0);
			return;
		}

		const { error: updateError } = await authClient.updateUser({
			name: username.trim(),
			username: username.trim(),
			image: selectedAvatar,
			role,
			badge: selectedBadge,
			onboarded: true,
		});

		if (updateError) {
			setError(updateError.message ?? "Something went wrong. Please try again.");
			setSaving(false);
			return;
		}

		router.push(nextDestination());
	};

	const handleSkip = async () => {
		await authClient.updateUser({ onboarded: false });
		router.push(nextDestination());
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
								transition={{ duration: DURATION_FAST, ease: "easeOut" }}
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
						<UsernameStep
							username={username}
							status={usernameStatus}
							onChange={handleUsernameChange}
						/>
					)}

					{step === 1 && (
						<ProfileStep
							username={username}
							role={role}
							selectedAvatar={selectedAvatar}
							previewing={previewing}
							onRoleChange={handleRoleChange}
							onSelectAvatar={setSelectedAvatar}
							onTogglePreview={() => setPreviewing((open) => !open)}
						/>
					)}

					{step === 2 && (
						<BadgeStep
							selectedBadge={selectedBadge}
							onSelectBadge={setSelectedBadge}
						/>
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
					<Button
						type="button"
						onClick={goBack}
						variant="outline"
						className="gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed"
					>
						<Image src={arrowIcon} alt="Back" width={20} height={20} className="rotate-180" />
						Back
					</Button>
				) : (
					<span />
				)}

				<Button
					type="button"
					onClick={step === STEPS.length - 1 ? handleFinish : goNext}
					disabled={!canProceed || saving || checkingUsername}
					className="gap-2 px-5 py-2 uppercase tracking-wider text-sm disabled:cursor-not-allowed"
				>
					{step === STEPS.length - 1
						? saving
							? "Saving..."
							: "Finish"
						: checkingUsername
							? "Checking..."
							: "Continue"}
					{step !== STEPS.length - 1 && !checkingUsername && (
						<Image src={arrowIcon} alt="Next" width={20} height={20} />
					)}
				</Button>
			</div>

			<div className="mt-4 text-center">
				<Button
					type="button"
					onClick={handleSkip}
					variant="link"
					size="sm"
					className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
				>
					Skip onboarding for now
				</Button>
			</div>
		</div>
	);
}
