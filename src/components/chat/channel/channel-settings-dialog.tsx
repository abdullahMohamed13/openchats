"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { Trash } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { getErrorMessage } from "@/lib/error-message";

interface ChannelSettingsDialogProps {
	channelId: Id<"channels">;
	channelName: string;
	isGeneral: boolean;
	onClose: () => void;
	onDeleted: () => void;
}

export function ChannelSettingsDialog({
	channelId,
	channelName,
	isGeneral,
	onClose,
	onDeleted,
}: ChannelSettingsDialogProps) {
	const renameChannel = useAction(api.channels.renameChannel);
	const deleteChannel = useAction(api.channels.deleteChannel);

	const [name, setName] = useState(channelName);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const busy = saving || deleting;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busy, onClose]);

	const trimmedName = name.trim();
	const canRename =
		!isGeneral &&
		trimmedName.length >= 1 &&
		trimmedName.length <= 40 &&
		trimmedName !== channelName &&
		!busy;

	const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canRename) return;

		setSaving(true);
		setError(null);
		try {
			await renameChannel({ channelId, name: trimmedName });
			onClose();
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not rename the channel."));
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (isGeneral) return;
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}

		setDeleting(true);
		setError(null);
		try {
			await deleteChannel({ channelId });
			onDeleted();
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not delete the channel."));
			setDeleting(false);
			setConfirmDelete(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
			<button
				type="button"
				aria-label="Close channel settings"
				onClick={busy ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="channel-settings-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border p-5">
					<h2
						id="channel-settings-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						Channel settings
					</h2>
					<p className="mt-2 text-sm text-muted-foreground"># {channelName}</p>
				</header>

				<div className="flex-1 overflow-y-auto p-5">
					<section>
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Name
						</h3>
						{isGeneral ? (
							<p className="mt-2 text-sm text-muted-foreground">
								The general channel can&apos;t be renamed or deleted.
							</p>
						) : (
							<form
								onSubmit={handleRename}
								className="mt-2 flex flex-col gap-2 sm:flex-row"
							>
								<Input
									value={name}
									onChange={(event) => setName(event.target.value)}
									disabled={saving}
									maxLength={40}
									aria-label="Channel name"
									className="h-11 flex-1"
								/>
								<Button
									type="submit"
									disabled={!canRename}
									className="shrink-0 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed"
								>
									{saving ? "Saving…" : "Save"}
								</Button>
							</form>
						)}
					</section>

					{!isGeneral && (
						<section className="mt-6 border-t border-border pt-5">
							<h3 className="text-xs font-semibold uppercase tracking-wide text-danger">
								Delete channel
							</h3>
							<p className="mt-2 text-xs text-muted-foreground">
								This permanently deletes the channel and its messages.
							</p>
							<Button
								type="button"
								onClick={() => void handleDelete()}
								disabled={busy}
								variant="destructive"
								className="mt-3 px-4 py-2 text-xs uppercase"
							>
								<Trash width={14} height={14} />
								{deleting
									? "Deleting…"
									: confirmDelete
										? "Click again to delete forever"
										: "Delete channel"}
							</Button>
						</section>
					)}

					{error && (
						<p role="alert" className="mt-4 text-xs text-danger">
							{error}
						</p>
					)}
				</div>

				<footer className="flex justify-end border-t border-border p-4">
					<Button
						type="button"
						onClick={onClose}
						disabled={busy}
						variant="outline"
						className="px-4 py-2 text-xs uppercase"
					>
						Done
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
