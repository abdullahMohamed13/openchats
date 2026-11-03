"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/8bit/button";

export function GuestSetup() {
	const router = useRouter();
	const setupGuest = useAction(api.guest.setupGuest);
	const [attempt, setAttempt] = useState(0);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setupGuest({})
			.then(() => {
				if (!cancelled) router.replace("/chat");
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [attempt, router, setupGuest]);

	if (failed) {
		return (
			<div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-shadow sm:p-8">
				<div className="flex flex-col items-center justify-center py-12">
					<p className="text-danger text-center">
						Failed to set up guest spaces. Please try again.
					</p>
					<Button
						type="button"
						onClick={() => {
							setFailed(false);
							setAttempt((current) => current + 1);
						}}
						className="mt-4"
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-shadow sm:p-8">
			<div className="flex flex-col items-center justify-center py-12">
				<div className="animate-spin rounded-full border-4 border-primary border-t-transparent h-10 w-10" />
				<p className="mt-4 text-sm text-muted-foreground">
					Setting up your guest spaces…
				</p>
			</div>
		</div>
	);
}
