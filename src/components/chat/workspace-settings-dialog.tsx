"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Logout, Trash, UserMinus, UserPlus } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Input } from "@/components/ui/8bit/input";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";
import {
	DEFAULT_AVATAR,
	type WorkspaceMember,
	type WorkspaceRole,
} from "./types";

interface WorkspaceSettingsDialogProps {
	workspaceId: Id<"workspaces">;
	workspaceName: string;
	role: WorkspaceRole;
	onClose: () => void;
	onInvite: () => void;
}

function roleLabel(role: WorkspaceRole): string {
	if (role === "owner") return "Owner";
	if (role === "admin") return "Admin";
	return "Member";
}

export function WorkspaceSettingsDialog({
	workspaceId,
	workspaceName,
	role,
	onClose,
	onInvite,
}: WorkspaceSettingsDialogProps) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const members = useQuery(api.workspaces.listMembers, { workspaceId });
	const renameWorkspace = useAction(api.workspaces.renameWorkspace);
	const setMemberRole = useAction(api.workspaces.setMemberRole);
	const removeMember = useAction(api.workspaces.removeMember);
	const leaveWorkspace = useAction(api.workspaces.leaveWorkspace);
	const deleteWorkspace = useAction(api.workspaces.deleteWorkspace);

	const canManage = role === "owner" || role === "admin";
	const isOwner = role === "owner";

	const [name, setName] = useState(workspaceName);
	const [savingName, setSavingName] = useState(false);
	const [nameSaved, setNameSaved] = useState(false);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
	const [confirmLeave, setConfirmLeave] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const busy =
		savingName ||
		leaving ||
		deleting ||
		removingId !== null ||
		changingRoleId !== null;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busy, onClose]);

	const trimmedName = name.trim();
	const canRename =
		canManage &&
		trimmedName.length >= 2 &&
		trimmedName.length <= 50 &&
		trimmedName !== workspaceName &&
		!savingName;

	const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canRename) return;

		setSavingName(true);
		setNameSaved(false);
		setError(null);
		try {
			await renameWorkspace({ workspaceId, name: trimmedName });
			setNameSaved(true);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not rename workspace."));
		} finally {
			setSavingName(false);
		}
	};

	const handleRoleChange = async (member: WorkspaceMember) => {
		const nextRole = member.role === "member" ? "admin" : "member";
		setChangingRoleId(member.userId);
		setError(null);
		try {
			await setMemberRole({
				workspaceId,
				userId: member.userId,
				role: nextRole,
			});
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not change member role."));
		} finally {
			setChangingRoleId(null);
		}
	};

	const handleRemove = async (member: WorkspaceMember) => {
		setRemovingId(member.userId);
		setError(null);
		try {
			await removeMember({ workspaceId, userId: member.userId });
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not remove member."));
		} finally {
			setRemovingId(null);
		}
	};

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

	const canRemove = (member: WorkspaceMember): boolean => {
		if (!canManage) return false;
		if (busy && removingId !== member.userId) return false;
		if (member.userId === session?.user.id) return false;
		if (member.role === "owner") return false;
		if (role === "admin" && member.role === "admin") return false;
		return true;
	};

	const canChangeRole = (member: WorkspaceMember): boolean => {
		if (!isOwner) return false;
		if (busy && changingRoleId !== member.userId) return false;
		if (member.userId === session?.user.id) return false;
		if (member.role === "owner") return false;
		return true;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
			<button
				type="button"
				aria-label="Close workspace settings"
				onClick={busy ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="workspace-settings-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col border-2 border-foreground bg-background shadow-[6px_6px_0px_var(--foreground)]"
			>
				<header className="flex items-start justify-between gap-3 border-b border-border p-5">
					<div>
						<h2
							id="workspace-settings-title"
							className="font-press-start text-sm uppercase text-foreground"
						>
							Workspace settings
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							{workspaceName} · You are {roleLabel(role).toLowerCase()}
						</p>
					</div>
					{canManage && (
						<BrutalButton
							type="button"
							onClick={onInvite}
							className="shrink-0 px-3 py-2 text-xs uppercase"
						>
							<UserPlus width={14} height={14} className="mr-1.5" />
							Invite
						</BrutalButton>
					)}
				</header>

				<div className="flex-1 overflow-y-auto p-5">
					{canManage && (
						<section>
							<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Name
							</h3>
							<form
								onSubmit={handleRename}
								className="mt-2 flex flex-col gap-2 sm:flex-row"
							>
								<Input
									value={name}
									onChange={(event) => {
										setName(event.target.value);
										setNameSaved(false);
									}}
									disabled={savingName}
									maxLength={50}
									aria-label="Workspace name"
									className="h-11 flex-1"
								/>
								<BrutalButton
									type="submit"
									disabled={!canRename}
									className="shrink-0 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
								>
									{savingName ? "Saving…" : "Save"}
								</BrutalButton>
							</form>
							{nameSaved && (
								<p role="status" className="mt-2 text-xs text-success">
									Workspace renamed.
								</p>
							)}
						</section>
					)}

					<section className={cn(canManage && "mt-6")}>
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Members
						</h3>
						{members === undefined ? (
							<p className="mt-3 text-sm text-muted-foreground">
								Loading members…
							</p>
						) : (
							<ul className="mt-3 flex flex-col divide-y divide-border border-y border-border">
								{members.map((member) => (
									<li
										key={member.userId}
										className="flex items-center gap-3 py-2.5"
									>
										<Image
											src={member.image ?? DEFAULT_AVATAR}
											alt=""
											width={32}
											height={32}
											className="size-8 rounded-full border border-border object-cover"
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm text-foreground">
												{member.name}
												{member.userId === session?.user.id && (
													<span className="text-muted-foreground"> (you)</span>
												)}
											</p>
											<p className="truncate text-xs text-muted-foreground">
												{member.username ? `@${member.username}` : member.email}
											</p>
										</div>
										<span
											className={cn(
												"shrink-0 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
												member.role === "owner"
													? "border-primary text-primary"
													: member.role === "admin"
														? "border-accent text-accent"
														: "border-border text-muted-foreground",
											)}
										>
											{roleLabel(member.role)}
										</span>
										{canChangeRole(member) && (
											<button
												type="button"
												onClick={() => void handleRoleChange(member)}
												disabled={changingRoleId !== null}
												aria-label={
													member.role === "member"
														? `Promote ${member.name} to admin`
														: `Demote ${member.name} to member`
												}
												title={
													member.role === "member"
														? `Promote ${member.name} to admin`
														: `Demote ${member.name} to member`
												}
												className="shrink-0 border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
											>
												{changingRoleId === member.userId
													? "…"
													: member.role === "member"
														? "Promote"
														: "Demote"}
											</button>
										)}
										{canRemove(member) && (
											<button
												type="button"
												onClick={() => void handleRemove(member)}
												disabled={removingId !== null}
												aria-label={`Remove ${member.name}`}
												title={`Remove ${member.name}`}
												className="flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-danger disabled:opacity-50"
											>
												{removingId === member.userId ? (
													<span className="text-[10px]">…</span>
												) : (
													<UserMinus width={16} height={16} />
												)}
											</button>
										)}
									</li>
								))}
							</ul>
						)}
					</section>

					{!isOwner && (
						<section className="mt-6 border-t border-border pt-5">
							<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Leave workspace
							</h3>
							<p className="mt-2 text-xs text-muted-foreground">
								You&apos;ll lose access to its channels and messages.
							</p>
							<BrutalButton
								type="button"
								onClick={() => void handleLeave()}
								disabled={busy}
								color="var(--danger)"
								textColor="var(--foreground)"
								borderColor="var(--border)"
								shadowColor="var(--border)"
								className="mt-3 px-4 py-2 text-xs uppercase disabled:opacity-50"
							>
								<Logout width={14} height={14} className="mr-1.5" />
								{leaving
									? "Leaving…"
									: confirmLeave
										? "Click again to leave"
										: "Leave workspace"}
							</BrutalButton>
						</section>
					)}

					{isOwner && (
						<section className="mt-6 border-t border-border pt-5">
							<h3 className="text-xs font-semibold uppercase tracking-wide text-danger">
								Delete workspace
							</h3>
							<p className="mt-2 text-xs text-muted-foreground">
								This permanently deletes the workspace, its channels, and
								invites for everyone.
							</p>
							<BrutalButton
								type="button"
								onClick={() => void handleDelete()}
								disabled={busy}
								color="var(--danger)"
								textColor="var(--foreground)"
								borderColor="var(--danger)"
								shadowColor="var(--danger)"
								className="mt-3 px-4 py-2 text-xs uppercase disabled:opacity-50"
							>
								<Trash width={14} height={14} className="mr-1.5" />
								{deleting
									? "Deleting…"
									: confirmDelete
										? "Click again to delete forever"
										: "Delete workspace"}
							</BrutalButton>
						</section>
					)}

					{error && (
						<p role="alert" className="mt-4 text-xs text-danger">
							{error}
						</p>
					)}
				</div>

				<footer className="flex justify-end border-t border-border p-4">
					<BrutalButton
						type="button"
						onClick={onClose}
						disabled={busy}
						className="px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						Done
					</BrutalButton>
				</footer>
			</motion.div>
		</div>
	);
}
