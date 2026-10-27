"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Input } from "@/components/ui/8bit/input";

interface CreateChannelDialogProps {
	workspaceId: Id<"workspaces">;
	onClose: () => void;
	onCreated: (channelId: string) => void;
}

export function CreateChannelDialog({
	workspaceId,
	onClose,
	onCreated,
}: CreateChannelDialogProps) {
	const createChannel = useAction(api.channels.createChannel);
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !saving) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [saving, onClose]);

	const trimmed = name.trim();
	const canSubmit = trimmed.length >= 1 && trimmed.length <= 40 && !saving;

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit) return;

		setSaving(true);
		setError(null);
		try {
			const { channelId } = await createChannel({
				workspaceId,
				name: trimmed,
			});
			setName("");
			onCreated(channelId);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Could not create the channel.",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close create channel dialog"
				onClick={saving ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="create-channel-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 w-full max-w-md border-2 border-foreground bg-background p-6 shadow-[6px_6px_0px_var(--foreground)]"
			>
				<h2
					id="create-channel-title"
					className="font-press-start text-sm uppercase text-foreground"
				>
					New channel
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					Everyone in the workspace will be added automatically.
				</p>

				<form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
					<label
						htmlFor="channel-name"
						className="text-xs uppercase tracking-wide text-muted-foreground"
					>
						Channel name
					</label>
					<Input
						id="channel-name"
						name="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="design-team"
						autoComplete="off"
						autoFocus
						maxLength={40}
						disabled={saving}
						aria-invalid={error ? true : undefined}
						className="h-12"
					/>
					<p className="text-xs text-muted-foreground">1 to 40 characters.</p>
					{error && (
						<p role="alert" className="text-xs text-danger">
							{error}
						</p>
					)}

					<div className="mt-4 flex justify-end gap-3">
						<BrutalButton
							type="button"
							onClick={onClose}
							disabled={saving}
							color="var(--danger)"
							textColor="var(--foreground)"
							borderColor="var(--border)"
							shadowColor="var(--border)"
							className="px-4 py-2 text-xs uppercase"
						>
							Cancel
						</BrutalButton>
						<BrutalButton
							type="submit"
							disabled={!canSubmit}
							className="bg-primary! px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
						>
							{saving ? "Creating…" : "Create"}
						</BrutalButton>
					</div>
				</form>
			</motion.div>
		</div>
	);
}
