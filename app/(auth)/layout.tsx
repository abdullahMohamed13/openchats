"use client";

import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const pathname = usePathname();
	// Users with an active session still need to be able to open a reset link
	// and set a new password.
	const isResetPassword = pathname === "/reset-password";

	useEffect(() => {
		if (!isPending && session && !isResetPassword) router.replace("/chat");
	}, [session, isPending, isResetPassword, router]);

	if (isPending) return null;
	if (session && !isResetPassword) return null;
	return (
		<div className="flex min-h-svh items-center justify-center">
			{children}
		</div>
	);
}
