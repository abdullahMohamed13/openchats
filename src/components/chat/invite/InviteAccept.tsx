"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/8bit/button";
import { getErrorMessage } from "@/lib/error-message";

const PENDING_INVITE_KEY = "openchats:pendingInvite";

interface InviteAcceptProps {
	token: string;
}

export function InviteAccept({ token }: InviteAcceptProps) {
	const router = useRouter();
	const invite = useQuery(api.invites.getInvite, { token });
	const acceptInvite = useAction(api.invites.acceptInvite);
	const { data: session, isPending } = authClient.useSession();
	const [accepting, setAccepting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const rememberInvite = () => {
		window.localStorage.setItem(PENDING_INVITE_KEY, token);
	};

	const handleAccept = async () => {
		setAccepting(true);
		setError(null);
		try {
			const { workspaceId } = await acceptInvite({ token });
			window.localStorage.removeItem(PENDING_INVITE_KEY);
			router.push(`/w/${workspaceId}`);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not accept the invite."));
			setAccepting(false);
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.reload();
	};

	const callback = encodeURIComponent(`/invite/${token}`);
	const signedInEmail = session?.user?.email?.toLowerCase() ?? "";
	const emailMismatch =
		invite?.status === "valid" &&
		invite.kind === "email" &&
		Boolean(invite.email) &&
		signedInEmail !== invite.email?.toLowerCase();

	let body: React.ReactNode;

	if (invite === undefined || isPending) {
		body = (
			<p className="text-sm text-muted-foreground">Checking your invite…</p>
		);
	} else if (invite.status !== "valid") {
		const message =
			invite.status === "expired"
				? "This invite has expired. Ask a workspace admin for a new one."
				: invite.status === "used"
					? "This invite has already been used."
					: "This invite link is not valid.";
		body = (
			<>
				<p className="text-sm text-muted-foreground">{message}</p>
				<Link
					href="/chat"
					className="mt-5 inline-flex border-2 border-foreground bg-background px-4 py-2 text-xs font-semibold uppercase text-foreground shadow-[3px_3px_0px_var(--foreground)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
				>
					Go to OpenChats
				</Link>
			</>
		);
	} else if (!session) {
		body = (
			<>
				<p className="mt-3 text-sm text-muted-foreground">
					{invite.inviterName} invited you to join{" "}
					<span className="font-semibold text-foreground">
						{invite.workspaceName}
					</span>
					.
				</p>
				<div className="mt-6 flex flex-col gap-3">
					<Link
						href={`/signin?callbackUrl=${callback}`}
						onClick={rememberInvite}
						className="inline-flex items-center justify-center border-2 border-foreground bg-primary px-4 py-3 text-xs font-bold uppercase text-primary-foreground shadow-[4px_4px_0px_var(--foreground)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
					>
						Sign in to accept
					</Link>
					<Link
						href="/signup"
						onClick={rememberInvite}
						className="inline-flex items-center justify-center border-2 border-border px-4 py-3 text-xs font-bold uppercase text-foreground transition-colors hover:border-foreground hover:bg-muted"
					>
						Create an account
					</Link>
				</div>
				<p className="mt-4 text-xs text-muted-foreground">
					Use the email address the invite was sent to, if it was an email
					invite.
				</p>
			</>
		);
	} else {
		body = (
			<>
				<p className="mt-3 text-sm text-muted-foreground">
					{invite.inviterName} invited you to join{" "}
					<span className="font-semibold text-foreground">
						{invite.workspaceName}
					</span>
					.
				</p>
				<p className="mt-2 text-xs text-muted-foreground">
					You&apos;re signed in as {session.user.email ?? session.user.name}.
				</p>
				{emailMismatch ? (
					<>
						<p className="mt-4 text-xs text-danger">
							This invite was sent to {invite.email}. Sign out and sign in with
							that address to join.
						</p>
						<Button
							type="button"
							onClick={() => void handleSignOut()}
							variant="outline"
							className="mt-6 w-full px-4 py-3 text-xs uppercase"
						>
							Sign out
						</Button>
					</>
				) : (
					<>
						<Button
							type="button"
							onClick={() => void handleAccept()}
							disabled={accepting}
							className="mt-6 w-full px-4 py-3 text-xs uppercase disabled:cursor-not-allowed"
						>
							{accepting ? "Joining…" : `Join ${invite.workspaceName}`}
						</Button>
						{error && (
							<p role="alert" className="mt-4 text-xs text-danger">
								{error}
							</p>
						)}
					</>
				)}
			</>
		);
	}

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10">
			<motion.div
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className="w-full max-w-md border-2 border-foreground bg-background p-6 shadow-[6px_6px_0px_var(--foreground)]"
			>
				<p className="font-press-start text-[10px] uppercase tracking-wide text-muted-foreground">
					OpenChats invite
				</p>
				<h1 className="mt-3 font-press-start text-lg uppercase leading-relaxed text-foreground">
					{invite?.status === "valid"
						? invite.workspaceName
						: "Invite unavailable"}
				</h1>
				{body}
			</motion.div>
		</div>
	);
}
