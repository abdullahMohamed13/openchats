"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	useEffect(() => {
		if (isPending) return;
		if (!session) {
			router.replace("/signin");
		} else if (session.user.onboarded) {
			router.replace("/dashboard");
		}
	}, [session, isPending, router]);

	if (isPending) return null;
	if (!session || session.user.onboarded) return null;
	return <>{children}</>;
}