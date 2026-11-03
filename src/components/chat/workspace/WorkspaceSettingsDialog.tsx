"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "pixelarticons/react";
import type { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Button } from "@/components/ui/8bit/button";
import { cn } from "@/lib/utils";
import type { WorkspaceRole } from "@/types/chat";
import { WorkspaceDangerZone } from "./settings/WorkspaceDangerZone";
import { WorkspaceIdentitySection } from "./settings/WorkspaceIdentitySection";
import { WorkspaceMembersSection } from "./settings/WorkspaceMembersSection";

interface WorkspaceSettingsDialogProps {
	workspaceId: Id<"workspaces">;
	workspaceName: string;
	workspaceImageUrl: string | null;
	role: WorkspaceRole;
	onClose: () => void;
	onInvite: () => void;
}

export function WorkspaceSettingsDialog({
	workspaceId,
	workspaceName,
	workspaceImageUrl,
	role,
	onClose,
	onInvite,
}: WorkspaceSettingsDialogProps) {
	const { data: session } = authClient.useSession();

	const canManage = role === "owner" || role === "admin";
	const isOwner = role === "owner";

	const [busyCount, setBusyCount] = useState(0);
	const handleBusyChange = useCallback((busy: boolean) => {
		setBusyCount((count) => Math.max(0, count + (busy ? 1 : -1)));
	}, []);
	const busy = busyCount > 0;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busy, onClose]);

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
						<WorkspaceIdentitySection
							workspaceId={workspaceId}
							workspaceName={workspaceName}
							workspaceImageUrl={workspaceImageUrl}
							onBusyChange={handleBusyChange}
						/>
					)}

					<div className={cn(canManage && "mt-6")}>
						<WorkspaceMembersSection
							workspaceId={workspaceId}
							sessionUserId={session?.user.id}
							role={role}
							onBusyChange={handleBusyChange}
						/>
					</div>

					<WorkspaceDangerZone
						workspaceId={workspaceId}
						isOwner={isOwner}
						onBusyChange={handleBusyChange}
					/>
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
