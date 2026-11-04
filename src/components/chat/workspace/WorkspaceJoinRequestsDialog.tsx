"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { WorkspaceJoinRequestsSection } from "./settings/WorkspaceJoinRequestsSection";

interface WorkspaceJoinRequestsDialogProps {
	workspaceId: Id<"workspaces">;
	onClose: () => void;
}

export function WorkspaceJoinRequestsDialog({
	workspaceId,
	onClose,
}: WorkspaceJoinRequestsDialogProps) {
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busy, onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close join requests"
				onClick={busy ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="join-requests-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border p-5">
					<h2
						id="join-requests-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						Workspace access
					</h2>
					<p className="mt-2 text-xs text-muted-foreground">
						Share the workspace ID or approve people waiting to join.
					</p>
				</header>

				<div className="flex-1 overflow-y-auto p-5">
					<WorkspaceJoinRequestsSection
						workspaceId={workspaceId}
						onBusyChange={setBusy}
					/>
				</div>

				<footer className="flex justify-end border-t border-border p-4">
					<Button
						type="button"
						onClick={onClose}
						disabled={busy}
						variant="outline"
						className="px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						Close
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
