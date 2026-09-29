"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loading, ArrowLeft } from "pixelarticons/react";
import { handleForgotPassword } from "@/lib/forgot-password";
import BrutalButton from "@/components/ui/brutal-button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		const trimmed = email.trim();
		if (trimmed.length === 0) {
			setError("Please enter your email address.");
			return;
		}
		if (!EMAIL_RE.test(trimmed)) {
			setError("Please enter a valid email address.");
			return;
		}

		const ok = await handleForgotPassword({ email: trimmed, setLoading });
		if (ok) setSent(true);
	};

	if (sent) {
		return (
			<AuthCard title="Check your inbox">
				<p className="text-sm text-muted-foreground">
					We sent a reset link to <span className="text-foreground">{email.trim()}</span>. The link expires
					in 1 hour.
				</p>
				<Link
					href="/signin"
					className="mt-2 block text-center text-sm text-accent underline transition-colors hover:text-foreground"
				>
					Back to sign in
				</Link>
			</AuthCard>
		);
	}

	return (
		<AuthCard title="Forgot Your Password?😏">
			<p className="text-sm text-muted-foreground text-center">
				No worries, enter your email and we&apos;ll send you a link to reset it.
			</p>

			<form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
				<div>
					<label htmlFor="forgot-email" className="mb-2 block text-sm">
						Email
					</label>
					<div className="relative">
						<Mail
							width={18}
							height={18}
							className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							id="forgot-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="guy_who_forgot@example.com"
							autoComplete="email"
							aria-invalid={error ? true : undefined}
							aria-describedby={error ? "forgot-email-error" : undefined}
							className="retro h-12 w-full rounded-none border-2 border-foreground bg-background pl-10 text-xs outline-none transition-all dark:border-ring focus-visible:border-accent focus-visible:shadow-[3px_3px_0px_var(--accent)]"
						/>
					</div>
					{error && (
						<p id="forgot-email-error" role="alert" className="mt-2 text-xs text-danger">
							{error}
						</p>
					)}
				</div>

				<BrutalButton
					type="submit"
					disabled={loading}
					color="var(--primary)"
					textColor="var(--foreground)"
					borderColor="var(--foreground)"
					className="gap-2 px-5 py-2.5 uppercase tracking-wider text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
				>
					{loading ? <Loading width={18} height={18} className="animate-spin" /> : "Send reset link"}
				</BrutalButton>
			</form>
		</AuthCard>
	);
}

function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="w-full max-w-md p-3 md:p-0">
			<Link
				href="/signin"
				aria-label="Go back to sign in"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft width={16} height={16} aria-hidden />
				Back
			</Link>
			<h1 className="retro mb-6 text-center text-2xl">{title}</h1>
			{children}
		</div>
	);
}
