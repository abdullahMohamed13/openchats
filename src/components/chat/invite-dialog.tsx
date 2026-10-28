"use client";

import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { AtSign, Check, Copy, Link, Mail } from "pixelarticons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Input } from "@/components/ui/8bit/input";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";

interface InviteDialogProps {
	workspaceId: Id<"workspaces">;
	onClose: () => void;
}

type Tab = "link" | "username" | "email";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
	{ id: "link", label: "Link", icon: <Link width={14} height={14} /> },
	{ id: "username", label: "Username", icon: <AtSign width={14} height={14} /> },
	{ id: "email", label: "Email", icon: <Mail width={14} height={14} /> },
];

export function InviteDialog({ workspaceId, onClose }: InviteDialogProps) {
	const createLinkInvite = useMutation(api.invites.createLinkInvite);
	const inviteByUsername = useAction(api.invites.inviteByUsername);
	const inviteByEmail = useAction(api.invites.inviteByEmail);
	const invites = useQuery(api.invites.listWorkspaceInvites, { workspaceId });
	const revokeInvite = useMutation(api.invites.revokeInvite);

	const [tab, setTab] = useState<Tab>("link");
	const [linkToken, setLinkToken] = useState<string | null>(null);
	const [linkLoading, setLinkLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [revokingId, setRevokingId] = useState<string | null>(null);
	const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
	const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

	const busy = saving || linkLoading || revokingId !== null;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [busy, onClose]);

	const inviteUrl = linkToken
		? `${window.location.origin}/invite/${linkToken}`
		: "";
	const activeInvites =
		invites?.filter((invite) => invite.status === "active") ?? [];

	const handleGenerateLink = async () => {
		setLinkLoading(true);
		setError(null);
		try {
			const { token } = await createLinkInvite({ workspaceId });
			setLinkToken(token);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not create a link."));
		} finally {
			setLinkLoading(false);
		}
	};

	const handleCopy = async () => {
		if (!inviteUrl) return;
		setError(null);
		try {
			await navigator.clipboard.writeText(inviteUrl);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setError("Could not copy. Select the link and copy it manually.");
		}
	};

	const handleCopyInvite = async (
		inviteId: Id<"workspaceInvites">,
		token: string,
	) => {
		setError(null);
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/invite/${token}`,
			);
			setCopiedInviteId(inviteId);
			window.setTimeout(() => setCopiedInviteId(null), 2000);
		} catch {
			setError("Could not copy. Select the link and copy it manually.");
		}
	};

	const handleRevoke = async (
		inviteId: Id<"workspaceInvites">,
		token: string | null,
	) => {
		if (confirmRevokeId !== inviteId) {
			setConfirmRevokeId(inviteId);
			return;
		}

		setRevokingId(inviteId);
		setError(null);
		try {
			await revokeInvite({ workspaceId, inviteId });
			setConfirmRevokeId(null);
			if (token && token === linkToken) setLinkToken(null);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not revoke the invite."));
		} finally {
			setRevokingId(null);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (saving) return;

		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			if (tab === "username") {
				const result = await inviteByUsername({
					workspaceId,
					username: username.trim(),
				});
				setSuccess(
					result.status === "already_member"
						? `${result.name} is already a member.`
						: `${result.name} was added to the workspace.`,
				);
				setUsername("");
			} else {
				const result = await inviteByEmail({
					workspaceId,
					email: email.trim(),
				});
				setSuccess(
					result.status === "already_member"
						? "That person is already a member."
						: "Invite sent. They'll get an email shortly.",
				);
				setEmail("");
			}
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not send the invite."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				aria-label="Close invite dialog"
				onClick={busy ? undefined : onClose}
				className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
			/>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="invite-dialog-title"
				initial={{ opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto border-2 border-foreground bg-background p-6 shadow-[6px_6px_0px_var(--foreground)]"
			>
				<h2
					id="invite-dialog-title"
					className="font-press-start text-sm uppercase text-foreground"
				>
					Invite people
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					Add teammates by username, send an email, or share a link.
				</p>

				<div className="mt-5 grid grid-cols-3 gap-2">
					{TABS.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => {
								setTab(item.id);
								setError(null);
								setSuccess(null);
							}}
							aria-pressed={tab === item.id}
							className={cn(
								"flex items-center justify-center gap-1.5 border-2 px-2 py-2 text-xs font-semibold uppercase transition-colors",
								tab === item.id
									? "border-foreground bg-primary text-primary-foreground"
									: "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
							)}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</div>

				<div className="mt-5">
					{tab === "link" && (
						<div className="flex flex-col gap-3">
							{linkToken ? (
								<>
									<label
										htmlFor="invite-link"
										className="text-xs uppercase tracking-wide text-muted-foreground"
									>
										Anyone with this link can join
									</label>
									<div className="flex gap-2">
										<Input
											id="invite-link"
											value={inviteUrl}
											readOnly
											onFocus={(event) => event.currentTarget.select()}
											className="h-11 flex-1 text-xs"
										/>
										<BrutalButton
											type="button"
											onClick={handleCopy}
											aria-label={copied ? "Copied invite link" : "Copy invite link"}
											className="shrink-0 px-3 py-2 text-xs uppercase"
										>
											{copied ? (
												<Check width={16} height={16} />
											) : (
												<Copy width={16} height={16} />
											)}
										</BrutalButton>
									</div>
									<p className="text-xs text-muted-foreground">
										This link is reusable and expires in 30 days.
									</p>
								</>
							) : (
								<>
									<p className="text-sm text-muted-foreground">
										Create a reusable link for this workspace.
									</p>
									<BrutalButton
										type="button"
										onClick={handleGenerateLink}
										disabled={linkLoading}
										className="mt-2 w-full px-4 py-2 text-xs uppercase disabled:opacity-50"
									>
										{linkLoading ? "Creating…" : "Create invite link"}
									</BrutalButton>
								</>
							)}
						</div>
					)}

					{tab === "username" && (
						<form onSubmit={handleSubmit} className="flex flex-col gap-2">
							<label
								htmlFor="invite-username"
								className="text-xs uppercase tracking-wide text-muted-foreground"
							>
								OpenChats username
							</label>
							<Input
								id="invite-username"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								placeholder="waltuh"
								autoComplete="off"
								autoFocus
								disabled={saving}
								className="h-11"
							/>
							<p className="text-xs text-muted-foreground">
								They&apos;ll be added instantly.
							</p>
							<BrutalButton
								type="submit"
								disabled={!username.trim() || saving}
								className="mt-2 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving ? "Adding…" : "Add to workspace"}
							</BrutalButton>
						</form>
					)}

					{tab === "email" && (
						<form onSubmit={handleSubmit} className="flex flex-col gap-2">
							<label
								htmlFor="invite-email"
								className="text-xs uppercase tracking-wide text-muted-foreground"
							>
								Email address
							</label>
							<Input
								id="invite-email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="teammate@example.com"
								autoComplete="email"
								autoFocus
								disabled={saving}
								className="h-11"
							/>
							<p className="text-xs text-muted-foreground">
								The invite expires in 7 days and only works for that address.
							</p>
							<BrutalButton
								type="submit"
								disabled={!email.trim() || saving}
								className="mt-2 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving ? "Sending…" : "Send invite"}
							</BrutalButton>
						</form>
					)}
				</div>

				<section className="mt-6 border-t border-border pt-4">
					<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Active invites
					</h3>
					{invites === undefined ? (
						<p className="mt-2 text-xs text-muted-foreground">
							Loading invites…
						</p>
					) : activeInvites.length === 0 ? (
						<p className="mt-2 text-xs text-muted-foreground">
							No active invites.
						</p>
					) : (
						<ul className="mt-3 flex max-h-52 flex-col divide-y divide-border overflow-y-auto border-y border-border">
							{activeInvites.map((invite) => (
								<li
									key={invite._id}
									className="flex items-center gap-2 py-2"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm text-foreground">
											{invite.kind === "email"
												? invite.email
												: "Reusable link"}
										</p>
										<p className="text-[10px] uppercase tracking-wide text-muted-foreground">
											Expires{" "}
											{new Date(invite.expiresAt).toLocaleDateString()}
										</p>
									</div>
									{invite.token && (
										<button
											type="button"
											onClick={() =>
												void handleCopyInvite(invite._id, invite.token!)
											}
											className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
										>
											{copiedInviteId === invite._id ? "Copied" : "Copy"}
										</button>
									)}
									<button
										type="button"
										onClick={() => void handleRevoke(invite._id, invite.token)}
										disabled={revokingId !== null}
										className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-danger transition-colors hover:opacity-80 disabled:opacity-50"
									>
										{revokingId === invite._id
											? "…"
											: confirmRevokeId === invite._id
												? "Confirm"
												: "Revoke"}
									</button>
								</li>
							))}
						</ul>
					)}
				</section>

				{error && (
					<p role="alert" className="mt-4 text-xs text-danger">
						{error}
					</p>
				)}
				{success && (
					<p role="status" className="mt-4 text-xs text-success">
						{success}
					</p>
				)}

				<div className="mt-6 flex justify-end">
					<BrutalButton
						type="button"
						onClick={onClose}
						disabled={busy}
						color="var(--danger)"
						textColor="var(--foreground)"
						borderColor="var(--border)"
						shadowColor="var(--border)"
						className="px-4 py-2 text-xs uppercase"
					>
						Close
					</BrutalButton>
				</div>
			</motion.div>
		</div>
	);
}
