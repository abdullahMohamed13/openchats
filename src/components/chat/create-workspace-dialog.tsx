"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Input } from "@/components/ui/8bit/input";
import { getErrorMessage } from "@/lib/error-message";

interface CreateWorkspaceDialogProps {
	onClose: () => void;
}

export function CreateWorkspaceDialog({ onClose }: CreateWorkspaceDialogProps) {
	const router = useRouter();
	const createWorkspace = useAction(api.workspaces.createWorkspace);
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
	const canSubmit = trimmed.length >= 2 && trimmed.length <= 50 && !saving;

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit) return;

		setSaving(true);
		setError(null);

		try {
			const { workspaceId } = await createWorkspace({ name: trimmed });
			setName("");
			onClose();
			router.push(`/w/${workspaceId}`);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not create the workspace."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close create workspace dialog"
				onClick={saving ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="create-workspace-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 w-full max-w-md border-2 border-foreground bg-background p-6 shadow-[6px_6px_0px_var(--foreground)]"
			>
				<h2
					id="create-workspace-title"
					className="font-press-start text-sm uppercase text-foreground"
				>
					New workspace
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					Give your team, club, or community a home. You can invite people once
					it exists.
				</p>

				<form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
					<label
						htmlFor="workspace-name"
						className="text-xs uppercase tracking-wide text-muted-foreground"
					>
						Workspace name
					</label>
					<Input
						id="workspace-name"
						name="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Potatoes Team"
						autoComplete="off"
						autoFocus
						maxLength={50}
						disabled={saving}
						aria-invalid={error ? true : undefined}
						className="h-12"
					/>
					<p className="text-xs text-muted-foreground">2 to 50 characters.</p>
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
							className="px-4 py-2 text-xs uppercase b"
						>
							Cancel
						</BrutalButton>
						<BrutalButton
							type="submit"
							disabled={!canSubmit}
							className="px-4 py-2 text-xs uppercase bg-primary! disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
						>
							{saving ? "Creating…" : "Create"}
						</BrutalButton>
					</div>
				</form>
			</motion.div>
		</div>
	);
}
