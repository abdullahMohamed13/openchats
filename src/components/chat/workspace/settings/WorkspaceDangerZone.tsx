"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { Logout, Trash } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { getErrorMessage } from "@/lib/error-message";

interface WorkspaceDangerZoneProps {
	workspaceId: Id<"workspaces">;
	isOwner: boolean;
	onBusyChange: (busy: boolean) => void;
}

export function WorkspaceDangerZone({
	workspaceId,
	isOwner,
	onBusyChange,
}: WorkspaceDangerZoneProps) {
	const router = useRouter();
	const leaveWorkspace = useAction(api.workspaceMembers.leaveWorkspace);
	const deleteWorkspace = useAction(api.workspaces.deleteWorkspace);

	const [confirmLeave, setConfirmLeave] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const busy = leaving || deleting;

	useEffect(() => {
		if (!busy) return;
		onBusyChange(true);
		return () => onBusyChange(false);
	}, [busy, onBusyChange]);

	const handleLeave = async () => {
		if (!confirmLeave) {
			setConfirmLeave(true);
			return;
		}
		setLeaving(true);
		setError(null);
		try {
			await leaveWorkspace({ workspaceId });
			router.push("/chat");
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not leave workspace."));
			setLeaving(false);
			setConfirmLeave(false);
		}
	};

	const handleDelete = async () => {
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		setDeleting(true);
		setError(null);
		try {
			await deleteWorkspace({ workspaceId });
			router.push("/chat");
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not delete workspace."));
			setDeleting(false);
			setConfirmDelete(false);
		}
	};

	return (
		<>
			{!isOwner && (
				<section className="mt-6 border-t border-border pt-5">
					<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Leave workspace
					</h3>
					<p className="mt-2 text-xs text-muted-foreground">
						You&apos;ll lose access to its channels and messages.
					</p>
					<Button
						type="button"
						onClick={() => void handleLeave()}
						disabled={busy}
						variant="destructive"
						className="mt-3 px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						<Logout width={14} height={14} className="mr-1.5" />
						{leaving
							? "Leaving…"
							: confirmLeave
								? "Click again to leave"
								: "Leave workspace"}
					</Button>
				</section>
			)}

			{isOwner && (
				<section className="flex flex-col md:flex-row items-center gap-4 mt-6">
					<div>
						<h3 className="font-press-start text-xs font-semibold uppercase tracking-wide text-danger">
							Delete workspace
						</h3>
						<p className="mt-2 text-xs text-muted-foreground">
							This permanently deletes the workspace, its channels, and
							invites for everyone.
						</p>
					</div>
					<Button
						type="button"
						onClick={() => void handleDelete()}
						disabled={busy}
						variant="destructive"
						className="mt-3 px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						<Trash width={14} height={14} className="mr-1.5" />
						{deleting
							? "Deleting…"
							: confirmDelete
								? "Click again to delete forever"
								: "Delete forever"}
					</Button>
				</section>
			)}

			{error && (
				<p role="alert" className="mt-4 text-xs text-danger">
					{error}
				</p>
			)}
		</>
	);
}
