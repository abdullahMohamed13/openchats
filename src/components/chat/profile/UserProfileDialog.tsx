"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DEFAULT_AVATAR } from "@/types/chat";
import { Button } from "@/components/ui/8bit/button";

interface UserProfileDialogProps {
	userId: string;
	onClose: () => void;
}

export function UserProfileDialog({ userId, onClose }: UserProfileDialogProps) {
	const profile = useQuery(api.profile.getUserProfile, { userId });

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
			<button
				type="button"
				aria-label="Close user profile"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="user-profile-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex w-full max-w-sm flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border px-5 py-5">
					<h2
						id="user-profile-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						Member profile
					</h2>
				</header>

				{profile === undefined ? (
					<p className="p-5 text-sm text-muted-foreground">Loading profile…</p>
				) : profile === null ? (
					<p className="p-5 text-sm text-muted-foreground">
						This profile is not available.
					</p>
				) : (
					<div className="flex flex-col gap-5 p-5">
						<div className="flex items-center gap-4">
							<Image
								src={profile.image ?? DEFAULT_AVATAR}
								alt=""
								width={72}
								height={72}
								className="size-16 shrink-0 rounded-full border-2 border-foreground object-cover shadow-[3px_3px_0px_var(--foreground)]"
							/>
							<div className="min-w-0">
								<p className="truncate text-base font-semibold text-foreground">
									{profile.name}
								</p>
								{profile.username && (
									<p className="truncate text-xs text-muted-foreground">
										@{profile.username}
									</p>
								)}
							</div>
							{profile.badge && (
								<Image
									src={profile.badge}
									alt=""
									width={40}
									height={40}
									className="ml-auto size-10 shrink-0 rounded-lg object-cover"
								/>
							)}
						</div>

						<dl className="divide-y divide-border border-y border-border text-sm">
							<div className="flex items-center justify-between gap-3 py-3">
								<dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Role
								</dt>
								<dd className="text-right text-foreground">
									{profile.role ?? "Member"}
								</dd>
							</div>
							<div className="flex items-center justify-between gap-3 py-3">
								<dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
									Account created
								</dt>
								<dd className="text-right text-foreground">
									{profile.createdAt
										? new Intl.DateTimeFormat(undefined, {
												dateStyle: "medium",
											}).format(new Date(profile.createdAt))
										: "Unknown"}
								</dd>
							</div>
						</dl>
					</div>
				)}

				<footer className="flex justify-end border-t border-border p-4">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="px-4 py-2 text-xs uppercase"
					>
						Close
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
