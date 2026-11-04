"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAction, useQuery } from "convex/react";
import { Crown, MoreVertical, UserMinus } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";
import { roleLabel } from "@/lib/workspace-role";
import { DEFAULT_AVATAR, type WorkspaceMember, type WorkspaceRole } from "@/types/chat";
import { TransferOwnershipDialog } from "./TransferOwnershipDialog";

const ROLE_ORDER: Record<WorkspaceRole, number> = {
	owner: 0,
	admin: 1,
	member: 2,
};

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
	const [transferTarget, setTransferTarget] = useState<WorkspaceMember | null>(null);
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

	const handleTransfer = (member: WorkspaceMember) => {
		setTransferTarget(member);
		setTransferNotice(null);
		setError(null);
	};

	const handleConfirmTransfer = async () => {
		if (!transferTarget) return;

		setTransferringId(transferTarget.userId);
		setError(null);
		try {
			await transferOwnership({
				workspaceId,
				userId: transferTarget.userId,
			});
			setTransferNotice(
				`Ownership transferred to ${transferTarget.name}. You are now an admin.`,
			);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not transfer ownership."));
		} finally {
			setTransferringId(null);
			setTransferTarget(null);
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

	const sortedMembers = members
		? [...members].sort(
				(a, b) =>
					ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
					a.joinedAt - b.joinedAt,
			)
		: undefined;

	return (
		<section>
			<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Members
			</h3>
			{sortedMembers === undefined ? (
				<div className="mt-3 flex flex-col gap-2">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className="h-12 w-full" />
					))}
				</div>
			) : (
				<ul className="mt-3 flex flex-col divide-y divide-border border-y border-border">
					{sortedMembers.map((member) => (
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
							{(canChangeRole(member) ||
								canTransferOwnership(member) ||
								canRemove(member)) && (
								<DropdownMenu>
									<DropdownMenuTrigger
										aria-label={`Actions for ${member.name}`}
										title={`Actions for ${member.name}`}
										className="inline-flex size-8 shrink-0 items-center justify-center border-none bg-transparent text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
									>
										<MoreVertical width={16} height={16} />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										{canChangeRole(member) && (
											<DropdownMenuItem
												className="cursor-pointer px-3 py-2 text-xs"
												onClick={() => void handleRoleChange(member)}
											>
												{member.role === "member"
													? "Promote to admin"
													: "Demote to member"}
											</DropdownMenuItem>
										)}
										{canTransferOwnership(member) && (
											<DropdownMenuItem
												className="cursor-pointer px-3 py-2 text-xs"
												onClick={() => handleTransfer(member)}
											>
												<Crown width={14} height={14} aria-hidden />
												Make owner
											</DropdownMenuItem>
										)}
										{canRemove(member) && (
											<DropdownMenuItem
												variant="destructive"
												className="cursor-pointer px-3 py-2 text-xs"
												onClick={() => void handleRemove(member)}
											>
												<UserMinus width={14} height={14} aria-hidden />
												Remove from workspace
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
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
			{transferTarget && (
				<TransferOwnershipDialog
					member={transferTarget}
					transferring={transferringId !== null}
					onCancel={() => setTransferTarget(null)}
					onConfirm={() => void handleConfirmTransfer()}
				/>
			)}
		</section>
	);
}
