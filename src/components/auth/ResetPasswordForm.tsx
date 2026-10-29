"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Lock, Loading, Eye, EyeOff } from "pixelarticons/react";
import { handleResetPassword } from "@/lib/reset-password";
import { PASSWORD_MIN_LENGTH, validateAuthField, type AuthFieldSpec } from "@/lib/auth-validation";
import BrutalButton from "@/components/ui/brutal-button";

const PASSWORD_SPEC: AuthFieldSpec = {
	name: "newPassword",
	label: "Password",
	minLength: PASSWORD_MIN_LENGTH,
	minLengthMsg: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
};

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={null}>
			<ResetPasswordForm />
		</Suspense>
	);
}

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? undefined;
	const tokenError = searchParams.get("error");

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [revealed, setRevealed] = useState({ new: false, confirm: false });

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		if (!token) {
			setError("This reset link is invalid or has expired. Request a new one.");
			return;
		}

		const fieldError = validateAuthField(PASSWORD_SPEC, newPassword);
		if (fieldError) {
			setError(fieldError);
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		const ok = await handleResetPassword({ newPassword, token, setLoading });
		if (ok) router.push("/signin");
	};

	if (tokenError || !token) {
		return (
			<div className="w-full max-w-md">
				<h1 className="retro mb-6 text-center text-2xl">Reset link expired</h1>
				<p className="text-sm text-muted-foreground">
					This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
				</p>
				<Link
					href="/forgot-password"
					className="mt-6 block text-center text-sm text-accent underline transition-colors hover:text-foreground"
				>
					Request a new link
				</Link>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md">
			<h1 className="retro mb-2 text-center text-2xl">Set a new password</h1>
			<p className="mb-6 text-center text-sm text-muted-foreground">
				Choose a new password for your OpenChats account.
			</p>

			<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
				<div>
					<label htmlFor="new-password" className="mb-2 block text-sm">
						New password
					</label>
					<div className="relative">
						<Lock
							width={18}
							height={18}
							className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							id="new-password"
							type={revealed.new ? "text" : "password"}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="••••••••"
							autoComplete="new-password"
							aria-invalid={error ? true : undefined}
							className="retro h-12 w-full rounded-none border-2 border-foreground bg-background pl-10 text-sm outline-none transition-all dark:border-ring focus-visible:border-accent focus-visible:shadow-[3px_3px_0px_var(--accent)]"
						/>
						<button
							type="button"
							onClick={() => setRevealed((p) => ({ ...p, confirm: !p.confirm }))}
							aria-label={revealed.confirm ? "Hide confirm password" : "Show confirm password"}
							aria-pressed={revealed.confirm}
							className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-accent"
						>
							{revealed.confirm ? <EyeOff width={18} height={18} aria-hidden /> : <Eye width={18} height={18} aria-hidden />}
						</button>
						<button
							type="button"
							onClick={() => setRevealed((p) => ({ ...p, new: !p.new }))}
							aria-label={revealed.new ? "Hide new password" : "Show new password"}
							aria-pressed={revealed.new}
							className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-accent"
						>
							{revealed.new ? <EyeOff width={18} height={18} aria-hidden /> : <Eye width={18} height={18} aria-hidden />}
						</button>
					</div>
				</div>

				<div>
					<label htmlFor="confirm-password" className="mb-2 block text-sm">
						Confirm password
					</label>
					<div className="relative">
						<Lock
							width={18}
							height={18}
							className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							id="confirm-password"
							type={revealed.confirm ? "text" : "password"}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••"
							autoComplete="new-password"
							aria-invalid={error ? true : undefined}
							className="retro h-12 w-full rounded-none border-2 border-foreground bg-background pl-10 text-sm outline-none transition-all dark:border-ring focus-visible:border-accent focus-visible:shadow-[3px_3px_0px_var(--accent)]"
						/>
					</div>
				</div>

				{error && (
					<p role="alert" className="text-sm text-danger">
						{error}
					</p>
				)}

				<BrutalButton
					type="submit"
					disabled={loading}
					color="var(--primary)"
					textColor="var(--foreground)"
					borderColor="var(--foreground)"
					className="gap-2 px-5 py-2.5 uppercase tracking-wider text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
				>
					{loading ? <Loading width={18} height={18} className="animate-spin" /> : "Update password"}
				</BrutalButton>
			</form>
		</div>
	);
}
