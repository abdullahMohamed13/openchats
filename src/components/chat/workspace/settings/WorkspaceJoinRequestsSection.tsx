"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAction, useMutation, useQuery } from "convex/react";
import { Check, Copy } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { getErrorMessage } from "@/lib/error-message";
import { DEFAULT_AVATAR } from "@/types/chat";

interface WorkspaceJoinRequestsSectionProps {
	workspaceId: Id<"workspaces">;
	onBusyChange: (busy: boolean) => void;
}

export function WorkspaceJoinRequestsSection({
	workspaceId,
	onBusyChange,
}: WorkspaceJoinRequestsSectionProps) {
	const requests = useQuery(api.joinRequests.listWorkspaceJoinRequests, {
		workspaceId,
	});
	const acceptRequest = useAction(api.joinRequests.acceptJoinRequest);
	const declineRequest = useMutation(api.joinRequests.declineJoinRequest);

	const [busyId, setBusyId] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const busy = busyId !== null;

	useEffect(() => {
		if (!busy) return;
		onBusyChange(true);
		return () => onBusyChange(false);
	}, [busy, onBusyChange]);

	const handleCopyId = async () => {
		setError(null);
		try {
			await navigator.clipboard.writeText(workspaceId);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setError("Could not copy. Select the ID and copy it manually.");
		}
	};

	const handleAccept = async (requestId: Id<"workspaceJoinRequests">) => {
		setBusyId(requestId);
		setError(null);
		try {
			await acceptRequest({ requestId });
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not accept the request."));
		} finally {
			setBusyId(null);
		}
	};

	const handleDecline = async (requestId: Id<"workspaceJoinRequests">) => {
		setBusyId(requestId);
		setError(null);
		try {
			await declineRequest({ requestId });
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not decline the request."));
		} finally {
			setBusyId(null);
		}
	};

	return (
		<section>
			<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Join requests
			</h3>
			<p className="mt-2 text-xs text-muted-foreground">
				Share this workspace ID with people who should join. They can request
				access from the workspace start screen.
			</p>
			<div className="mt-2 flex gap-2">
				<Input
					value={workspaceId}
					readOnly
					onFocus={(event) => event.currentTarget.select()}
					aria-label="Workspace ID"
					className="h-10 flex-1 font-mono text-xs"
				/>
				<Button
					type="button"
					onClick={() => void handleCopyId()}
					aria-label={copied ? "Copied workspace ID" : "Copy workspace ID"}
					variant="outline"
					size="icon"
					className="size-10 shrink-0"
				>
					{copied ? (
						<Check width={16} height={16} />
					) : (
						<Copy width={16} height={16} />
					)}
				</Button>
			</div>

			{requests === undefined ? (
				<div className="mt-4 flex flex-col gap-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<Skeleton key={index} className="h-12 w-full" />
					))}
				</div>
			) : requests.length === 0 ? (
				<p className="mt-4 text-xs text-muted-foreground">
					No pending join requests.
				</p>
			) : (
				<ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
					{requests.map((request) => (
						<li
							key={request._id}
							className="flex flex-wrap items-center gap-3 py-2.5"
						>
							<Image
								src={request.image ?? DEFAULT_AVATAR}
								alt=""
								width={32}
								height={32}
								className="size-8 rounded-full border border-border object-cover"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm text-foreground">
									{request.name}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{request.username
										? `@${request.username}`
										: request.email}
								</p>
							</div>
							<div className="flex shrink-0 gap-2">
								<Button
									type="button"
									onClick={() => void handleAccept(request._id)}
									disabled={busy}
									size="sm"
									className="px-3 py-1.5 text-[10px] uppercase disabled:cursor-not-allowed"
								>
									{busyId === request._id ? "…" : "Accept"}
								</Button>
								<Button
									type="button"
									onClick={() => void handleDecline(request._id)}
									disabled={busy}
									variant="outline"
									size="sm"
									className="px-3 py-1.5 text-[10px] uppercase disabled:cursor-not-allowed"
								>
									Decline
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}

			{error && (
				<p role="alert" className="mt-3 text-xs text-danger">
					{error}
				</p>
			)}
		</section>
	);
}
