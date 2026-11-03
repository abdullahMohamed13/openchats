"use client";

import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const pathname = usePathname();
	const isGuest = !!session?.user?.isAnonymous;
	// Signed-in users can still open a reset link and set a new password, but a
	// guest session has no password to reset and must not enter.
	const isResetPassword = pathname === "/reset-password" && !isGuest;
	// Guests can reach signup to upgrade their account. Newly created accounts
	// also need a moment here before the signup callback moves them to onboarding.
	const isSignup =
		pathname === "/signup" &&
		!!session &&
		(session.user.isAnonymous || session.user.onboarded !== true);
	const canStaySignedIn = isResetPassword || isSignup;

	useEffect(() => {
		if (!isPending && session && !canStaySignedIn) router.replace("/chat");
	}, [session, isPending, canStaySignedIn, router]);

	if (isPending) return null;
	if (session && !canStaySignedIn) return null;
	return (
		<div className="flex min-h-svh items-center justify-center">
			{children}
		</div>
	);
}
