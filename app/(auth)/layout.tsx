"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	useEffect(() => {
		if (!isPending && session) router.replace("/dashboard");
	}, [session, isPending, router]);

	if (isPending || session) return null;
	return (
		<div className="flex min-h-svh items-center justify-center">
			{children}
		</div>
	);
}
