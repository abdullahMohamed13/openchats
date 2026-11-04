"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SquareAlert } from "pixelarticons/react";
import { Button } from "@/components/ui/8bit/button";
import { DEFAULT_AVATAR, type WorkspaceMember } from "@/types/chat";

interface TransferOwnershipDialogProps {
	member: WorkspaceMember;
	transferring: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export function TransferOwnershipDialog({
	member,
	transferring,
	onCancel,
	onConfirm,
}: TransferOwnershipDialogProps) {
	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
			<button
				type="button"
				aria-label="Cancel ownership transfer"
				onClick={transferring ? undefined : onCancel}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="transfer-ownership-title"
				aria-describedby="transfer-ownership-description"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 flex w-full max-w-md flex-col border-2 border-danger bg-background shadow-[6px_6px_0px_var(--danger)]"
			>
				<div className="flex items-start gap-3 border-b border-border p-5">
					<span className="flex size-10 shrink-0 items-center justify-center border-2 border-danger text-danger">
						<SquareAlert width={20} height={20} aria-hidden />
					</span>
					<div className="min-w-0">
						<h2
							id="transfer-ownership-title"
							className="font-press-start text-sm uppercase text-foreground"
						>
							Transfer ownership?
						</h2>
						<p className="mt-2 text-xs text-muted-foreground">
							This changes who controls the workspace and cannot be undone by
							you alone.
						</p>
					</div>
				</div>

				<div id="transfer-ownership-description" className="flex flex-col gap-4 p-5">
					<div className="flex items-center gap-3 border border-border bg-muted/40 p-3">
						<Image
							src={member.image ?? DEFAULT_AVATAR}
							alt=""
							width={36}
							height={36}
							className="size-9 shrink-0 rounded-full border border-border object-cover"
						/>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-foreground">
								{member.name}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{member.username ? `@${member.username}` : member.email}
							</p>
						</div>
					</div>

					<p className="text-sm text-foreground">
						You are about to make {member.name} the owner of this workspace.
					</p>
					<p className="border-l-4 border-danger bg-danger/10 p-3 text-sm text-danger">
						You will lose owner access and become an admin. {member.name} will be
						able to manage members, delete the workspace, and transfer ownership
						again.
					</p>
				</div>

				<footer className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
					<Button
						type="button"
						onClick={onCancel}
						disabled={transferring}
						variant="outline"
						className="px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={onConfirm}
						disabled={transferring}
						variant="destructive"
						className="px-4 py-2 text-xs uppercase disabled:opacity-50"
					>
						{transferring ? "Transferring…" : "Transfer ownership"}
					</Button>
				</footer>
			</motion.div>
		</div>
	);
}
