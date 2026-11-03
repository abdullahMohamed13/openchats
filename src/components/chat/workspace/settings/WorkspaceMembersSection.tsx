"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAction, useQuery } from "convex/react";
import { Crown, UserMinus } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";
import { roleLabel } from "@/lib/workspace-role";
import { DEFAULT_AVATAR, type WorkspaceMember, type WorkspaceRole } from "@/types/chat";

interface WorkspaceMembersSectionProps {
	workspaceId: Id<"workspaces">;
	sessionUserId: string | undefined;
	role: WorkspaceRole;
	onBusyChange: (busy: boolean) => void;
}

export function WorkspaceMembersSection({
	workspaceId,
	sessionUserId,
	role,
	onBusyChange,
}: WorkspaceMembersSectionProps) {
	const members = useQuery(api.workspaceMembers.listMembers, { workspaceId });
	const setMemberRole = useAction(api.workspaceMembers.setMemberRole);
	const transferOwnership = useAction(api.workspaceMembers.transferOwnership);
	const removeMember = useAction(api.workspaceMembers.removeMember);

	const [removingId, setRemovingId] = useState<string | null>(null);
	const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
	const [transferringId, setTransferringId] = useState<string | null>(null);
	const [confirmTransferId, setConfirmTransferId] = useState<string | null>(null);
	const [transferNotice, setTransferNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const canManage = role === "owner" || role === "admin";
	const isOwner = role === "owner";
	const busy =
		removingId !== null || changingRoleId !== null || transferringId !== null;

	useEffect(() => {
		if (!busy) return;
		onBusyChange(true);
		return () => onBusyChange(false);
	}, [busy, onBusyChange]);

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

	const handleTransfer = async (member: WorkspaceMember) => {
		if (confirmTransferId !== member.userId) {
			setConfirmTransferId(member.userId);
			setTransferNotice(null);
			setError(null);
			return;
		}

		setTransferringId(member.userId);
		setError(null);
		try {
			await transferOwnership({ workspaceId, userId: member.userId });
			setConfirmTransferId(null);
			setTransferNotice(
				`Ownership transferred to ${member.name}. You are now an admin.`,
			);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not transfer ownership."));
			setConfirmTransferId(null);
		} finally {
			setTransferringId(null);
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

	const canRemove = (member: WorkspaceMember): boolean => {
		if (!canManage) return false;
		if (busy && removingId !== member.userId) return false;
		if (member.userId === sessionUserId) return false;
		if (member.role === "owner") return false;
		if (role === "admin" && member.role === "admin") return false;
		return true;
	};

	const canChangeRole = (member: WorkspaceMember): boolean => {
		if (!isOwner) return false;
		if (busy && changingRoleId !== member.userId) return false;
		if (member.userId === sessionUserId) return false;
		if (member.role === "owner") return false;
		return true;
	};

	const canTransferOwnership = (member: WorkspaceMember): boolean => {
		if (!isOwner) return false;
		if (busy && transferringId !== member.userId) return false;
		if (member.userId === sessionUserId) return false;
		if (member.role === "owner") return false;
		return true;
	};

	return (
		<section>
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
							className="flex flex-wrap items-center gap-3 py-2.5"
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
									{member.userId === sessionUserId && (
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
							{canTransferOwnership(member) && (
								<Button
									type="button"
									onClick={() => void handleTransfer(member)}
									disabled={transferringId !== null}
									aria-label={`Make ${member.name} the workspace owner`}
									title={`Make ${member.name} the workspace owner`}
									variant={
										confirmTransferId === member.userId
											? "destructive"
											: "outline"
									}
									size="sm"
									className="h-auto shrink-0 gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
								>
									{transferringId === member.userId ? (
										"…"
									) : confirmTransferId === member.userId ? (
										"Confirm?"
									) : (
										<>
											<Crown width={12} height={12} aria-hidden />
											Make owner
										</>
									)}
								</Button>
							)}
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
			{transferNotice && (
				<p role="status" className="mt-3 text-xs text-success">
					{transferNotice}
				</p>
			)}
			{error && (
				<p role="alert" className="mt-3 text-xs text-danger">
					{error}
				</p>
			)}
		</section>
	);
}
