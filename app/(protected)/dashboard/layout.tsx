"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logout } from "pixelarticons/react";
import { authClient } from "@/lib/auth-client";
import { handleSignOut } from "@/lib/sign-out";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	return (
		<div className="bg-background! min-h-screen pr-4 py-4">
			<header className="flex items-center justify-between px-4 py-2">
				<h1 className="font-press-start text-sm uppercase">Dashboard</h1>
				<div className="flex items-center gap-3">
					{session?.user.image && (
						<Image
							src={session.user.image}
							alt={`${session.user.name}'s profile picture`}
							width={32}
							height={32}
							className="size-8 rounded-full object-cover"
						/>
					)}
					{session?.user.badge && (
						<Image
							src={session.user.badge}
							alt="Badge"
							width={24}
							height={24}
							className="size-6 object-cover"
						/>
					)}
					<button
						onClick={() => handleSignOut(router)}
						className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
						aria-label="Sign out"
					>
						<Logout width={18} height={18} />
						Sign out
					</button>
				</div>
			</header>
			{children}
		</div>
	);
}
