"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { getErrorMessage } from "@/lib/error-message";
import { roleLabel } from "@/lib/workspace-role";

interface InvitationsDialogProps {
	onClose: () => void;
}

export function InvitationsDialog({ onClose }: InvitationsDialogProps) {
	const router = useRouter();
	const invites = useQuery(api.invites.listMyInvites);
	const acceptInvite = useAction(api.invites.acceptInvite);
	const declineInvite = useMutation(api.invites.declineInvite);

	const [busyId, setBusyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busyId) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busyId, onClose]);

	const handleAccept = async (token: string) => {
		setBusyId(token);
		setError(null);
		try {
			const { workspaceId } = await acceptInvite({ token });
			onClose();
			router.push(`/chat/w/${workspaceId}`);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not accept the invite."));
			setBusyId(null);
		}
	};

	const handleDecline = async (inviteId: Id<"workspaceInvites">) => {
		setBusyId(inviteId);
		setError(null);
		try {
			await declineInvite({ inviteId });
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not decline the invite."));
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close invitations"
				onClick={busyId ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="invitations-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="border-b border-border p-5">
					<h2
						id="invitations-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						Invitations
					</h2>
					<p className="mt-2 text-xs text-muted-foreground">
						Workspaces you&apos;ve been invited to.
					</p>
				</header>

				<div className="flex-1 overflow-y-auto p-5">
					{invites === undefined ? (
						<p className="text-sm text-muted-foreground">
							Loading invitations…
						</p>
					) : invites.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							You don&apos;t have any invitations right now.
						</p>
					) : (
						<ul className="flex flex-col divide-y divide-border border-y border-border">
							{invites.map((invite) => (
								<li key={invite._id} className="py-3">
									<p className="text-sm text-foreground">
										<span className="font-semibold">{invite.inviterName}</span>{" "}
										invited you to{" "}
										<span className="font-semibold">
											{invite.workspaceName}
										</span>
									</p>
									<p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
										{roleLabel(invite.role)} ·{" "}
										{invite.status === "expired"
											? "Expired"
											: `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
									</p>
									<div className="mt-2 flex gap-2">
										{invite.status === "active" && (
											<Button
												type="button"
												onClick={() => void handleAccept(invite.token)}
												disabled={busyId !== null}
												size="sm"
												className="px-3 py-1.5 text-[10px] uppercase disabled:cursor-not-allowed"
											>
												{busyId === invite.token ? "Joining…" : "Accept"}
											</Button>
										)}
										<Button
											type="button"
											onClick={() => void handleDecline(invite._id)}
											disabled={busyId !== null}
											variant="outline"
											size="sm"
											className="px-3 py-1.5 text-[10px] uppercase disabled:cursor-not-allowed"
										>
											{busyId === invite._id
												? "Removing…"
												: invite.status === "expired"
													? "Dismiss"
													: "Decline"}
										</Button>
									</div>
								</li>
							))}
						</ul>
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
						disabled={busyId !== null}
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
