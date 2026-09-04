"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION_FAST } from "@/lib/motion";
import { User } from "pixelarticons/react";
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
import arrowIcon from "@/assets/icons/arrow.webp";
import { resolveEmailByUsername } from "@/lib/resolveEmailByUsername";

import { CHARACTERS } from "../../data/characters";
import { BADGES } from "../../data/badges";

const ROLES = [
	"Team lead",
	"Team member",
	"Student",
	"Club member",
	"Community organizer",
	"Project collaborator",
] as const;

type Role = (typeof ROLES)[number];

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

const slugifyName = (name?: string | null): string => {
	if (!name) return "";
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_.]/g, "")
		.slice(0, 20);
};

const STEPS = [
	{ title: "Username", subtitle: "What should we call you?" },
	// { title: "Phone", subtitle: "How can we reach you?" },
	{ title: "Avatar", subtitle: "Pick your role and choose an avatar" },
	{ title: "Badge", subtitle: "Pick a badge that represents you" },
] as const;

export default function OnboardingWizard() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const [step, setStep] = useState(0);
	const [username, setUsername] = useState<string>(() => slugifyName(session?.user.name));
	const [role, setRole] = useState<Role | "">("");
	const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
	const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
	const [previewing, setPreviewing] = useState(false);
	const [usingExistingImage, setUsingExistingImage] = useState(false);
	const [customImage, setCustomImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [saving, setSaving] = useState(false);
	const [checkingUsername, setCheckingUsername] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const existingImage = session?.user.image ?? null;
	const finalImage = usingExistingImage
		? existingImage
		: customImage ?? selectedAvatar ?? null;

	const canProceed =
		step === 0
			? USERNAME_PATTERN.test(username.trim())
			: step === 1
				? role !== "" && (usingExistingImage || customImage !== null || selectedAvatar !== null)
				: selectedBadge !== null;

	const progressValue = Math.round(
		([
			USERNAME_PATTERN.test(username.trim()),
			role !== "" && (usingExistingImage || customImage !== null || selectedAvatar !== null),
			selectedBadge !== null,
		].filter(Boolean).length /
			STEPS.length) *
			100
	);

	const handleRoleChange = (value: Role) => {
		setRole(value);
		setPreviewing(false);
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("Please choose an image file.");
			return;
		}

		const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
		if (file.size > MAX_IMAGE_SIZE) {
			setError("Image is too large. Please choose a file under 3MB.");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				setCustomImage(reader.result);
				setSelectedAvatar(null);
				setUsingExistingImage(false);
				setPreviewing(false);
				setError(null);
			}
		};
		reader.readAsDataURL(file);
	};

	const goNext = async () => {
		if (!canProceed || checkingUsername) return;
		setError(null);

		if (step === 0) {
			setCheckingUsername(true);
			const email = await resolveEmailByUsername(username.trim());
			setCheckingUsername(false);

			if (email && email !== session?.user.email) {
				setError("This username is already taken. Try another one.");
				return;
			}
		}

		setStep((current) => Math.min(current + 1, STEPS.length - 1));
	};

	const goBack = () => {
		setError(null);
		setStep((current) => Math.max(current - 1, 0));
	};

	const handleFinish = async () => {
		if (!finalImage || !selectedBadge || saving) return;
		setSaving(true);
		setError(null);

		const email = await resolveEmailByUsername(username.trim());
		if (email && email !== session?.user.email) {
			setError("This username is already taken. Try another one.");
			setSaving(false);
			return;
		}

		const { error: updateError } = await authClient.updateUser({
			name: username.trim(),
			username: username.trim(),
			image: finalImage,
			role,
			badge: selectedBadge,
			onboarded: true,
		});

		if (updateError) {
			setError(updateError.message ?? "Something went wrong. Please try again.");
			setSaving(false);
			return;
		}

		router.push("/dashboard");
	};

	const handleSkip = async () => {
		await authClient.updateUser({ onboarded: false });
		router.push("/dashboard");
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
						<div>
							<label htmlFor="username" className="mb-2 block text-sm ">
								Username
							</label>
							<div className="relative">
								<User
									width={16}
									height={16}
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
							{existingImage && (
								<div className="mb-4">
									<p className="mb-2 text-xs text-muted-foreground">Profile picture</p>
									<div className="grid grid-cols-2 gap-3">
										<button
											type="button"
											aria-pressed={usingExistingImage}
											onClick={() => {
												setUsingExistingImage(true);
												setSelectedAvatar(null);
												setCustomImage(null);
												setPreviewing(false);
											}}
											className={cn(
												"flex items-center gap-3 rounded-xl border-2 p-2 pr-3 text-left transition-all duration-150",
												usingExistingImage
													? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
													: "border-border hover:border-accent"
											)}
										>
											<Image
												src={existingImage}
												alt="Your current profile picture"
												width={40}
												height={40}
												className="size-10 shrink-0 rounded-full object-cover"
											/>
											<span className="text-xs leading-snug">Use my current photo</span>
										</button>
										<button
											type="button"
											aria-pressed={!usingExistingImage}
											onClick={() => {
												setUsingExistingImage(false);
												setCustomImage(null);
												setPreviewing(false);
											}}
											className={cn(
												"flex items-center justify-center rounded-xl border-2 p-2 text-xs transition-all duration-150",
												!usingExistingImage
													? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
													: "border-border hover:border-accent"
											)}
										>
											Choose a new one
										</button>
									</div>
								</div>
							)}

							<label htmlFor="role" className="mb-2 block text-sm ">
								Role
							</label>
							<DropdownMenu>
								<DropdownMenuTrigger
									id="role"
									className={cn(
										"retro h-12 w-full rounded-none border-2 border-foreground bg-popover px-4 text-left text-xs outline-none transition-all dark:border-ring",
										"focus-visible:border-accent focus-visible:shadow-[3px_3px_0px_var(--accent)] data-popup-open:border-accent data-popup-open:shadow-[3px_3px_0px_var(--accent)]",
										role ? "" : "text-muted-foreground"
									)}
								>
									{role || "Select your role"}
								</DropdownMenuTrigger>
								<DropdownMenuContent aria-label="Role options">
									{ROLES.map((r) => (
										<DropdownMenuItem
											key={r}
											className={cn(role === r && "text-accent")}
											onClick={() => handleRoleChange(r)}
										>
											{r}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<AnimatePresence mode="wait" initial={false}>
								{role && !usingExistingImage && (
									<motion.div
										key={role}
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.25, ease: "easeOut" }}
										className="mt-6"
									>
										<div className="mb-2 flex items-center justify-between">
											<p className="text-xs text-muted-foreground">Pick a character</p>
											<button
												type="button"
												onClick={() => fileInputRef.current?.click()}
												className="text-xs text-accent underline transition-colors hover:text-foreground"
											>
												Upload your own
											</button>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												className="hidden"
												onChange={handleImageUpload}
											/>
										</div>

										{customImage ? (
											<div className="flex items-center justify-between rounded-xl border-2 border-primary p-2 pl-3 shadow-[3px_3px_0px_var(--primary)]">
												<div className="flex items-center gap-3">
													<Image
														src={customImage}
														alt="Your uploaded picture"
														width={40}
														height={40}
														className="size-10 shrink-0 rounded-full object-cover"
													/>
													<span className="text-xs">Your image</span>
												</div>
												<button
													type="button"
													onClick={() => setCustomImage(null)}
													className="text-xs text-muted-foreground underline transition-colors hover:text-foreground"
												>
													Remove
												</button>
											</div>
										) : (
											<div
												className="grid grid-cols-4 gap-3 sm:grid-cols-5"
												role="group"
												aria-label="Choose an avatar"
											>
												{CHARACTERS.map((character, index) => {
													const selected = selectedAvatar === character;
													return (
														<button
															key={character}
															type="button"
															aria-label={`Avatar ${index + 1}`}
															aria-pressed={selected}
															onClick={() => {
																setSelectedAvatar(character);
																setCustomImage(null);
															}}
															className={cn(
																"aspect-square overflow-hidden rounded-full border-2 transition-all duration-150 hover:scale-105",
																selected
																	? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
																	: "border-border hover:border-accent"
															)}
														>
															<Image
																src={character}
																alt=""
																width={100}
																height={100}
																className="size-full object-cover"
															/>
														</button>
													);
												})}
											</div>
										)}
									</motion.div>
								)}
							</AnimatePresence>

							<div className="mt-3 flex justify-end">
								<BrutalButton
									type="button"
									onClick={() => setPreviewing((open) => !open)}
									disabled={!finalImage}
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
								{previewing && finalImage && (
									<motion.div
										initial={{ opacity: 0, y: 12, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 8, scale: 0.97 }}
										transition={{ duration: DURATION_FAST, ease: "easeOut" }}
										className="mt-4 border-2 border-foreground bg-popover p-4 dark:border-ring"
									>
										<div className="flex items-center gap-4">
											{usingExistingImage ? (
												<Image
													src={finalImage}
													alt="Preview of your current profile picture"
													width={140}
													height={140}
													className="size-35 shrink-0 rounded-full object-cover"
												/>
											) : customImage ? (
												<Image
													src={customImage}
													alt="Preview of your uploaded image"
													width={140}
													height={140}
													className="size-35 shrink-0 rounded-full object-cover"
												/>
											) : (
												<Image
													src={selectedAvatar!}
													alt="Preview of your chosen avatar"
													width={140}
													height={140}
													className="size-35 shrink-0 rounded-full object-cover"
												/>
											)}
											<div className="retro truncate text-sm  min-w-0">
												{username.trim()}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}

					{step === 2 && (
						<div>
							<div
								className="grid grid-cols-4 gap-3 sm:grid-cols-6"
								role="group"
								aria-label="Choose a badge"
							>
								{BADGES.map((badge, index) => {
									const selected = selectedBadge === badge;
									return (
										<button
											key={badge}
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
												width={100}
												height={100}
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
										transition={{ duration: DURATION_FAST, ease: "easeOut" }}
										className="mt-4 flex items-center gap-3 border-2 border-foreground bg-popover p-3 dark:border-ring"
									>
										<Image
											src={selectedBadge}
											alt="Your chosen badge"
											width={48}
											height={48}
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
					<Image src={arrowIcon} alt="Back" width={20} height={20} className="rotate-180" />
					Back
				</BrutalButton>
			) : (
				<span />
			)}

			<BrutalButton
				type="button"
				onClick={step === STEPS.length - 1 ? handleFinish : goNext}
				disabled={!canProceed || saving || checkingUsername}
				color="var(--primary)"
				textColor="var(--foreground)"
				borderColor="var(--foreground)"
				className="gap-2 px-5 py-2 uppercase tracking-wider text-sm! disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
			>
				{step === STEPS.length - 1
					? saving
						? "Saving..."
						: "Finish"
					: checkingUsername
						? "Checking..."
						: "Continue"}
				{step !== STEPS.length - 1 && !checkingUsername && <Image src={arrowIcon} alt="Next" width={20} height={20} />}
			</BrutalButton>
		</div>

		<div className="mt-4 text-center">
			<button
				type="button"
				onClick={handleSkip}
				className="text-xs text-muted-foreground underline transition-colors hover:text-foreground"
			>
				Skip onboarding for now
			</button>
		</div>
		</div>
	);
}
