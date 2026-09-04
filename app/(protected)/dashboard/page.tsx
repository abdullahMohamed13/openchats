"use client";

import { authClient } from "@/lib/auth-client";

export default function Dashboard() {
	const { data: session } = authClient.useSession();

	return <div>hi {session?.user.name}</div>;
}