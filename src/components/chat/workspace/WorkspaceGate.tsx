"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/8bit/button";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { JoinWorkspaceDialog } from "./JoinWorkspaceDialog";
import { InvitationsDialog } from "../invite/InvitationsDialog";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/8bit/spinner";

export function WorkspaceGate() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { isAuthenticated } = useConvexAuth();
	const isGuest = session?.user?.isAnonymous;
	const workspaces = useQuery(
		api.workspaces.listMyWorkspaces,
		isAuthenticated ? undefined : "skip",
	);
	const myInvites = useQuery(
		api.invites.listMyInvites,
		isAuthenticated && !isGuest ? undefined : "skip",
	);
	const [createOpen, setCreateOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);
	const [invitationsOpen, setInvitationsOpen] = useState(false);

	const firstWorkspace = workspaces?.[0];
	const activeInviteCount =
		myInvites?.filter((invite) => invite.status === "active").length ?? 0;

	useEffect(() => {
		if (firstWorkspace) {
			router.replace(`/chat/w/${firstWorkspace._id}`);
		}
	}, [firstWorkspace, router]);

	// While signing out, the protected layout is about to unmount this page.
	// Don't briefly render the first-workspace/"create workspace" screen.
	if (!session || !isAuthenticated || workspaces === null) return null;

	if (workspaces === undefined) {
		return (
			<main className="flex min-h-screen flex-col gap-2 w-full items-center justify-center bg-background text-sm text-muted-foreground">
				Loading workspaces…
				<Spinner variant="diamond" />
			</main>
		);
	}

	if (firstWorkspace) {
		return (
			<main className="flex min-h-screen w-full items-center justify-center bg-background text-sm text-muted-foreground">
				Opening {firstWorkspace.name} 
			</main>
		);
	}

	if (isGuest) {
		// For guests, if workspaces is empty (not just undefined), show setup message
		if (workspaces.length === 0) {
			return (
				<main className="flex min-h-screen flex-col gap-2 w-full items-center justify-center bg-background text-sm text-muted-foreground">
					Setting up your guest spaces
					<Spinner variant="diamond" />
				</main>
			);
		}
		// Guest workspaces loaded; fall through to normal rendering
	}

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
			<div
				className="pointer-events-none absolute inset-0 opacity-20"
				style={{
					backgroundImage:
						"linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
				aria-hidden
			/>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="relative w-full max-w-lg border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_var(--border)]"
			>
				<div className="flex-center gap-2">
					<Image
						src="logo.webp"
						alt="Openchats logo"
						width={50}
						height={50}
						className="rounded-full object-cover"
					/>
					<p className="font-press-start text-xs uppercase tracking-widest text-primary">
						OpenChats
					</p>
				</div>
				<h1 className="mt-4 font-press-start text-xl uppercase leading-relaxed">
					Create or join a workspace
				</h1>
				<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
					Workspaces keep channels, conversations, and people together. Create
					your own or join a team that already has one.
				</p>

				{activeInviteCount > 0 && (
					<div className="mt-6 border border-primary/60 bg-primary/10 p-4">
						<p className="text-xs uppercase tracking-wide text-primary">
							{activeInviteCount} invitation
							{activeInviteCount === 1 ? "" : "s"} waiting
						</p>
						<Button
							type="button"
							onClick={() => setInvitationsOpen(true)}
							variant="outline"
							className="mt-3 h-10 w-full text-xs uppercase"
						>
							View invitations
						</Button>
					</div>
				)}

				<Button
					type="button"
					onClick={() => setCreateOpen(true)}
					className="mt-8 h-11 w-full text-sm uppercase"
				>
					Create workspace
				</Button>
				<Button
					type="button"
					onClick={() => setJoinOpen(true)}
					variant="outline"
					className="mt-3 h-11 w-full text-sm uppercase"
				>
					Join with workspace ID
				</Button>
			</motion.div>

			{createOpen && (
				<CreateWorkspaceDialog onClose={() => setCreateOpen(false)} />
			)}
			{joinOpen && (
				<JoinWorkspaceDialog onClose={() => setJoinOpen(false)} />
			)}
			{invitationsOpen && (
				<InvitationsDialog onClose={() => setInvitationsOpen(false)} />
			)}
		</main>
	);
}
