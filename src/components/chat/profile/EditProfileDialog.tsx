"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
	checkUsername,
	type UsernameAvailability,
} from "@/lib/is-username-taken";
import { getErrorMessage } from "@/lib/error-message";
import { CHARACTERS } from "@/data/characters";
import { BADGES } from "@/data/badges";
import { ROLES, type Role } from "@/data/onboarding";
import { DEFAULT_AVATAR } from "@/types/chat";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu";
import { cn } from "@/lib/utils";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

interface EditProfileDialogProps {
	onClose: () => void;
}

export function EditProfileDialog({ onClose }: EditProfileDialogProps) {
	const { data: session } = authClient.useSession();
	const changeUsername = useMutation(api.profile.changeUsername);
	const syncStreamProfile = useAction(api.stream.syncStreamProfile);

	const [name, setName] = useState(session?.user.name ?? "");
	const [username, setUsername] = useState(session?.user.username ?? "");
	const [role, setRole] = useState<Role | "">(
		(session?.user.role as Role | null | undefined) ?? "",
	);
	const [selectedAvatar, setSelectedAvatar] = useState(
		session?.user.image ?? DEFAULT_AVATAR,
	);
	const [selectedBadge, setSelectedBadge] = useState<string | null>(
		session?.user.badge ?? null,
	);
	const [usernameStatus, setUsernameStatus] = useState<
		UsernameAvailability | "checking" | "idle"
	>("available");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const normalizedUsername = username.trim().toLowerCase();
	const currentUsername = (session?.user.username ?? "").toLowerCase();
	const usernameChanged = normalizedUsername !== currentUsername;
	const usernameValid = USERNAME_PATTERN.test(normalizedUsername);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !saving) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, saving]);

	useEffect(() => {
		if (!session?.user.id || !usernameChanged || !usernameValid) return;

		let cancelled = false;
		const timer = setTimeout(async () => {
			const availability = await checkUsername(
				normalizedUsername,
				session.user.id,
			);
			if (!cancelled) setUsernameStatus(availability);
		}, 2000);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [
		normalizedUsername,
		session?.user.id,
		usernameChanged,
		usernameValid,
	]);

	const trimmedName = name.trim();
	const canSave =
		trimmedName.length >= 1 &&
		trimmedName.length <= 50 &&
		usernameValid &&
		(!usernameChanged || usernameStatus === "available") &&
		!saving;

	const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSave || !session?.user.id) return;

		setSaving(true);
		setError(null);
		try {
			if (usernameChanged) {
				await changeUsername({ username: normalizedUsername });
			}

			const { error: updateError } = await authClient.updateUser({
				name: trimmedName,
				image: selectedAvatar,
				...(role ? { role } : {}),
				...(selectedBadge ? { badge: selectedBadge } : {}),
			});
			if (updateError) {
				throw new Error(updateError.message ?? "Could not update your profile");
			}

			await syncStreamProfile({});
			onClose();
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not save your profile."));
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
			<button
				type="button"
				aria-label="Close edit profile"
				onClick={saving ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="edit-profile-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border px-5 py-5">
					<h2
						id="edit-profile-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						Edit profile
					</h2>
				</header>

				<form
					onSubmit={handleSave}
					className="flex min-h-0 flex-1 flex-col"
				>
					<div className="flex-1 overflow-y-auto p-5">
						<section className="flex items-center gap-4 border-b border-border pb-5">
							<Image
								src={selectedAvatar}
								alt=""
								width={64}
								height={64}
								className="size-16 shrink-0 rounded-full border-2 border-foreground object-cover shadow-[3px_3px_0px_var(--foreground)]"
							/>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-foreground">
									{trimmedName || "Your name"}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{normalizedUsername ? `@${normalizedUsername}` : "No username yet"}
									{role ? ` · ${role}` : ""}
								</p>
							</div>
							{selectedBadge && (
								<Image
									src={selectedBadge}
									alt=""
									width={40}
									height={40}
									className="ml-auto size-10 shrink-0 rounded-lg object-cover"
								/>
							)}
						</section>

						<section className="mt-5">
							<label htmlFor="profile-name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Display name
							</label>
							<Input
								id="profile-name"
								type="text"
								value={name}
								onChange={(event) => {
									setName(event.target.value);
									setError(null);
								}}
								placeholder="Your name"
								autoComplete="name"
								maxLength={50}
								disabled={saving}
								className="h-11"
							/>
						</section>

						<section className="mt-5">
							<label htmlFor="profile-username" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Username
							</label>
							<Input
								id="profile-username"
								type="text"
								value={username}
								onChange={(event) => {
									const value = event.target.value.toLowerCase();
									setUsername(value);
									setUsernameStatus(
										USERNAME_PATTERN.test(value.trim())
											? "checking"
											: "idle",
									);
									setError(null);
								}}
								placeholder="e.g. hysm_67"
								autoComplete="off"
								spellCheck={false}
								maxLength={20}
								disabled={saving}
								className="h-11"
							/>
							<p className="mt-2 text-xs text-muted-foreground">
								3-20 characters. Small letters only, numbers, dots and underscores.
							</p>
							{usernameChanged && usernameStatus === "checking" && (
								<p className="mt-1 text-xs text-muted-foreground">
									Checking username…
								</p>
							)}
							{usernameChanged && usernameStatus === "available" && (
								<p className="mt-1 text-xs text-success">
									This username is available.
								</p>
							)}
							{usernameChanged && usernameStatus === "taken" && (
								<p role="alert" className="mt-1 text-xs text-danger">
									This username is already taken.
								</p>
							)}
							{usernameChanged && usernameStatus === "unavailable" && (
								<p role="alert" className="mt-1 text-xs text-danger">
									Could not check this username. Try again.
								</p>
							)}
						</section>

						<section className="mt-5">
							<label htmlFor="profile-role" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Role
							</label>
							<DropdownMenu>
								<DropdownMenuTrigger
									id="profile-role"
									disabled={saving}
									className={cn(
										"retro h-11 w-full rounded-none border-2 border-foreground bg-popover px-4 text-left text-xs outline-none transition-all dark:border-ring",
										"focus-visible:border-accent focus-visible:shadow-[3px_3px_0px_var(--accent)] data-popup-open:border-accent data-popup-open:shadow-[3px_3px_0px_var(--accent)]",
										role ? "" : "text-muted-foreground",
									)}
								>
									{role || "Select your role"}
								</DropdownMenuTrigger>
								<DropdownMenuContent aria-label="Role options">
									{ROLES.map((option) => (
										<DropdownMenuItem
											key={option}
											className={cn(role === option && "text-accent")}
											onClick={() => setRole(option)}
										>
											{option}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</section>

						<section className="mt-5">
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Avatar
							</p>
							<div
								className="grid grid-cols-5 gap-2.5 sm:grid-cols-6"
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
											disabled={saving}
											onClick={() => setSelectedAvatar(character)}
											className={cn(
												"aspect-square overflow-hidden rounded-full border-2 transition-all duration-150 hover:scale-105 disabled:cursor-not-allowed",
												selected
													? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
													: "border-border hover:border-accent",
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
						</section>

						<section className="mt-5">
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Badge
							</p>
							<div
								className="grid grid-cols-5 gap-2.5 sm:grid-cols-7"
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
											disabled={saving}
											onClick={() => setSelectedBadge(badge)}
											className={cn(
												"aspect-square overflow-hidden rounded-lg border-2 transition-all duration-150 hover:scale-105 disabled:cursor-not-allowed",
												selected
													? "scale-105 border-primary shadow-[3px_3px_0px_var(--primary)]"
													: "border-border hover:border-accent",
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
						</section>

						{error && (
							<p role="alert" className="mt-4 text-xs text-danger">
								{error}
							</p>
						)}
					</div>

					<footer className="flex justify-end gap-2 border-t border-border p-4">
						<Button
							type="button"
							onClick={onClose}
							disabled={saving}
							variant="outline"
							className="px-4 py-2 text-xs uppercase disabled:opacity-50"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!canSave}
							className="px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
						>
							{saving ? "Saving…" : "Save changes"}
						</Button>
					</footer>
				</form>
			</motion.div>
		</div>
	);
}
