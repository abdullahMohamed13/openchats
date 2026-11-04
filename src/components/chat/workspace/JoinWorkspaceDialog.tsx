"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { getErrorMessage } from "@/lib/error-message";

interface JoinWorkspaceDialogProps {
	onClose: () => void;
}

export function JoinWorkspaceDialog({ onClose }: JoinWorkspaceDialogProps) {
	const requestToJoin = useMutation(api.joinRequests.requestToJoinWorkspace);
	const pendingRequests = useQuery(api.joinRequests.listMyJoinRequests);

	const [workspaceId, setWorkspaceId] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !sending) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [sending, onClose]);

	const canSubmit = workspaceId.trim().length > 0 && !sending;

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit) return;

		setSending(true);
		setError(null);
		setSuccess(null);
		try {
			await requestToJoin({ workspaceId: workspaceId.trim() });
			setWorkspaceId("");
			setSuccess("Request sent. A workspace admin needs to accept it.");
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not send the join request."));
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close join workspace dialog"
				onClick={sending ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="join-workspace-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto border-2 border-foreground bg-background p-6 shadow-[6px_6px_0px_var(--foreground)]"
			>
				<h2
					id="join-workspace-title"
					className="font-press-start text-sm uppercase text-foreground"
				>
					Join a workspace
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					Ask the workspace owner or an admin for its workspace ID, then paste
					it below. They&apos;ll approve your request.
				</p>

				<form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2">
					<label
						htmlFor="workspace-id"
						className="text-xs uppercase tracking-wide text-muted-foreground"
					>
						Workspace ID
					</label>
					<Input
						id="workspace-id"
						value={workspaceId}
						onChange={(event) => {
							setWorkspaceId(event.target.value);
							setSuccess(null);
						}}
						placeholder="jx7abc123…"
						autoComplete="off"
						autoFocus
						disabled={sending}
						className="h-11 font-mono text-xs"
					/>
					<Button
						type="submit"
						disabled={!canSubmit}
						className="mt-2 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed"
					>
						{sending ? "Sending…" : "Request to join"}
					</Button>
				</form>

				{pendingRequests && pendingRequests.length > 0 && (
					<section className="mt-6 border-t border-border pt-4">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Pending requests
						</h3>
						<ul className="mt-2 flex flex-col gap-1">
							{pendingRequests.map((request) => (
								<li
									key={request._id}
									className="text-sm text-muted-foreground"
								>
									{request.workspaceName}
								</li>
							))}
						</ul>
					</section>
				)}

				{error && (
					<p role="alert" className="mt-4 text-xs text-danger">
						{error}
					</p>
				)}
				{success && (
					<p role="status" className="mt-4 text-xs text-success">
						{success}
					</p>
				)}

				<div className="mt-6 flex justify-end">
					<Button
						type="button"
						onClick={onClose}
						disabled={sending}
						variant="outline"
						className="px-4 py-2 text-xs uppercase"
					>
						Close
					</Button>
				</div>
			</motion.div>
		</div>
	);
}
