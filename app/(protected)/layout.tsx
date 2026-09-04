"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	useEffect(() => {
		if (!isPending && !session) router.replace("/signin");
	}, [session, isPending, router]);

	if (isPending) return null;
	if (!session) return null;
	return <div>{children}</div>;
}
