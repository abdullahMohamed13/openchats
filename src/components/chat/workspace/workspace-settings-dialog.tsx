"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Logout, Trash, UserMinus, UserPlus } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";
import { WorkspaceAvatar } from "./workspace-avatar";
import {
	DEFAULT_AVATAR,
	type WorkspaceMember,
	type WorkspaceRole,
} from "@/types/chat";

const MAX_WORKSPACE_IMAGE_BYTES = 5 * 1024 * 1024;

interface WorkspaceSettingsDialogProps {
	workspaceId: Id<"workspaces">;
	workspaceName: string;
	workspaceImageUrl: string | null;
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
	workspaceImageUrl,
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
	const generateImageUploadUrl = useMutation(
		api.workspaces.generateWorkspaceImageUploadUrl,
	);
	const setWorkspaceImage = useMutation(api.workspaces.setWorkspaceImage);
	const removeWorkspaceImage = useMutation(api.workspaces.removeWorkspaceImage);

	const canManage = role === "owner" || role === "admin";
	const isOwner = role === "owner";

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState(workspaceName);
	const [savingName, setSavingName] = useState(false);
	const [nameSaved, setNameSaved] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [removingImage, setRemovingImage] = useState(false);
	const [imageSaved, setImageSaved] = useState(false);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
	const [confirmLeave, setConfirmLeave] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const busy =
		savingName ||
		uploadingImage ||
		removingImage ||
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

	const handleImageSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("Choose an image file.");
			return;
		}
		if (file.size > MAX_WORKSPACE_IMAGE_BYTES) {
			setError("Workspace images must be 5 MB or smaller.");
			return;
		}

		setUploadingImage(true);
		setImageSaved(false);
		setError(null);
		try {
			const uploadUrl = await generateImageUploadUrl({ workspaceId });
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!response.ok) {
				throw new Error("Could not upload the image.");
			}
			const { storageId } = (await response.json()) as {
				storageId: Id<"_storage">;
			};
			await setWorkspaceImage({ workspaceId, storageId });
			setImageSaved(true);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not update workspace image."));
		} finally {
			setUploadingImage(false);
		}
	};

	const handleRemoveImage = async () => {
		setRemovingImage(true);
		setImageSaved(false);
		setError(null);
		try {
			await removeWorkspaceImage({ workspaceId });
			setImageSaved(true);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not remove workspace image."));
		} finally {
			setRemovingImage(false);
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
				<header className="flex items-center justify-between gap-3 border-b border-border px-5 py-5">
					<h2
						id="workspace-settings-title"
						className="font-press-start text-sm uppercase text-foreground"
					>
						Workspace settings
					</h2>
					{canManage && (
						<BrutalButton
							type="button"
							onClick={onInvite}
							className="shrink-0 px-3 py-2 bg-primary! text-xs uppercase"
						>
							<UserPlus width={14} height={14} className="mr-1.5" />
							Invite
						</BrutalButton>
					)}
				</header>

				<div className="flex-1 overflow-y-auto p-5">
					{canManage && (
						<>
							<section>
								<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Image
								</h3>
								<div className="mt-2 flex flex-wrap items-center gap-4">
									<WorkspaceAvatar
										name={workspaceName}
										imageUrl={workspaceImageUrl}
										className="size-16 rounded-none border-2 border-foreground bg-muted shadow-[3px_3px_0px_var(--foreground)]"
										initialsClassName="text-sm"
									/>
									<div className="flex flex-wrap items-center gap-2">
										<input
											ref={fileInputRef}
											id="workspace-image"
											name="workspace-image"
											type="file"
											accept="image/*"
											aria-label="Workspace image"
											className="sr-only"
											disabled={busy}
											onChange={(event) => void handleImageSelected(event)}
										/>
										<Button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											disabled={busy}
											className="px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
										>
											{uploadingImage
												? "Uploading…"
												: workspaceImageUrl
													? "Change image"
													: "Upload image"}
										</Button>
										{workspaceImageUrl && (
											<Button
												type="button"
												variant="destructive"
												onClick={() => void handleRemoveImage()}
												disabled={busy}
												className="px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
											>
												{removingImage ? "Removing…" : "Remove"}
											</Button>
										)}
									</div>
								</div>
								<p className="mt-2 text-xs text-muted-foreground">
									PNG, JPG, GIF or WebP, up to 5 MB.
								</p>
								{imageSaved && (
									<p role="status" className="mt-2 text-xs text-success">
										Workspace image updated.
									</p>
								)}
							</section>

							<section className="mt-6">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Name
								</h3>
								<form
									onSubmit={handleRename}
									className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-center"
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
									<Button
										type="submit"
										disabled={!canRename}
										className="shrink-0 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
									>
										{savingName ? "Saving…" : "Save"}
									</Button>
								</form>
								{nameSaved && (
									<p role="status" className="mt-2 text-xs text-success">
										Workspace renamed.
									</p>
								)}
							</section>
						</>
					)}

					<section className={cn(canManage && "mt-6")}>
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Members
						</h3>
						{members === undefined ? (
							<div className="mt-3 flex flex-col gap-2">
								{Array.from({ length: 3 }).map((_, index) => (
									<Skeleton key={index} className="h-12 w-full" />
								))}
							</div>
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
											<Button
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
												variant="outline"
												size="sm"
												className="h-auto shrink-0 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
											>
												{changingRoleId === member.userId
													? "…"
													: member.role === "member"
														? "Promote"
														: "Demote"}
											</Button>
										)}
										{canRemove(member) && (
											<Button
												type="button"
												onClick={() => void handleRemove(member)}
												disabled={removingId !== null}
												aria-label={`Remove ${member.name}`}
												title={`Remove ${member.name}`}
												variant="ghost"
												size="sm"
												className="size-8 shrink-0 p-0 text-danger hover:text-danger/60"
											>
												{removingId === member.userId ? (
													<span className="text-[10px]">…</span>
												) : (
													<UserMinus width={16} height={16} />
												)}
											</Button>
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
				</div>

				<footer className="flex justify-end border-t border-border p-4">
					<Button
						type="button"
						onClick={onClose}
						disabled={busy}
						className="px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						Done
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
