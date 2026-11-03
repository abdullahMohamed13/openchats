"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION_FAST } from "@/lib/motion";
import { CHARACTERS } from "@/data/characters";
import { ROLES, type Role } from "@/data/onboarding";
import { Button } from "@/components/ui/8bit/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu";

interface ProfileStepProps {
	username: string;
	role: Role | "";
	selectedAvatar: string | null;
	previewing: boolean;
	onRoleChange: (role: Role) => void;
	onSelectAvatar: (avatar: string) => void;
	onTogglePreview: () => void;
}

export function ProfileStep({
	username,
	role,
	selectedAvatar,
	previewing,
	onRoleChange,
	onSelectAvatar,
	onTogglePreview,
}: ProfileStepProps) {
	return (
		<div>
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
					{ROLES.map((option) => (
						<DropdownMenuItem
							key={option}
							className={cn(role === option && "text-accent")}
							onClick={() => onRoleChange(option)}
						>
							{option}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			<AnimatePresence mode="wait" initial={false}>
				{role && (
					<motion.div
						key={role}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className="mt-6"
					>
						<p className="mb-2 text-xs text-muted-foreground">Pick a character</p>

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
										onClick={() => onSelectAvatar(character)}
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
					</motion.div>
				)}
			</AnimatePresence>

			<div className="mt-3 flex justify-end">
				<Button
					type="button"
					onClick={onTogglePreview}
					disabled={!selectedAvatar}
					variant="outline"
					size="sm"
					className="gap-2 px-3 py-1.5 text-xs disabled:cursor-not-allowed"
				>
					{previewing ? "Close preview" : "Preview"}
				</Button>
			</div>

			<AnimatePresence initial={false}>
				{previewing && selectedAvatar && (
					<motion.div
						initial={{ opacity: 0, y: 12, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8, scale: 0.97 }}
						transition={{ duration: DURATION_FAST, ease: "easeOut" }}
						className="mt-4 border-2 border-foreground bg-popover p-4 dark:border-ring"
					>
						<div className="flex items-center gap-4">
							<Image
								src={selectedAvatar}
								alt="Preview of your chosen avatar"
								width={140}
								height={140}
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
	);
}
