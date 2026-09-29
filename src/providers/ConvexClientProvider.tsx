"use client";

import { type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { convex } from "@/lib/convex-client";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		<ConvexBetterAuthProvider
			client={convex}
			authClient={authClient}
		>
			{children}
		</ConvexBetterAuthProvider>
	);
}
