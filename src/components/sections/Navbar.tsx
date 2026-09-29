"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Logout, Grid2x22, Flag, Close, Menu } from "pixelarticons/react";
import { authClient } from "@/lib/auth-client";
import { handleSignOut } from "@/lib/sign-out";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useSmoothScroll } from "@/providers/SmoothScrollProvider";
import "@/styles/retro.css";

const LINKS = [
	{ href: "#how-it-works", label: "How it works" },
	{ href: "#features", label: "Features" },
	{ href: "#use-cases", label: "Use cases" },
	{ href: "#faq", label: "FAQ" },
] as const;

export default function Navbar() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [userOpen, setUserOpen] = useState(false);
	const [avatarBroken, setAvatarBroken] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);
	const { scrollTo } = useSmoothScroll();

	const user = session?.user;
	const needsOnboarding = !isPending && !!user && user.onboarded !== true;
	const showAvatar = !!user?.image && !avatarBroken;

	useEffect(() => {
		if (!userOpen) return;
		const onPointerDown = (e: MouseEvent) => {
			if (!userMenuRef.current?.contains(e.target as Node)) setUserOpen(false);
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setUserOpen(false);
		};
		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [userOpen]);

	const onAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		e.preventDefault();
		setMenuOpen(false);
		scrollTo(href);
		history.replaceState(null, "", href);
	};

	const onSignOut = async () => {
		setUserOpen(false);
		await handleSignOut(router);
	};

	return (
		<header className="sticky top-0 z-50 border-b-2 border-foreground/10 bg-background/90 backdrop-blur-sm">
			<div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-8">
				<Link href="/" className="shrink-0" aria-label="OpenChats home">
					<Image src="/logo.webp" alt="OpenChats" width={28} height={28} className="size-7 object-contain" />
				</Link>

				<nav aria-label="Main" className="hidden md:block">
					<ul className="flex items-center gap-1">
						{LINKS.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									onClick={(e) => onAnchorClick(e, link.href)}
									className="retro rounded-none px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="ml-auto flex items-center gap-2">
					{isPending ? null : user ? (
						<div ref={userMenuRef} className="relative">
							<button
								type="button"
								onClick={() => setUserOpen((v) => !v)}
								aria-expanded={userOpen}
								aria-haspopup="menu"
								aria-label="Account menu"
								className="flex size-9 items-center justify-center border-2 border-foreground bg-muted transition-colors hover:border-accent"
							>
								{showAvatar ? (
									<Image
										src={user.image!}
										alt=""
										width={28}
										height={28}
										onError={() => setAvatarBroken(true)}
										className="pixelated size-full object-cover"
									/>
								) : (
									<User width={18} height={18} aria-hidden />
								)}
							</button>

							{userOpen && (
								<div
									role="menu"
									className="absolute right-0 top-full z-50 mt-2 w-52 border-2 border-foreground bg-background p-1 shadow-[3px_3px_0px_var(--accent)]"
								>
									<div className="border-b border-foreground/10 px-3 py-2">
										<p className="retro truncate text-xs font-medium">{user.name}</p>
										{user.username && (
											<p className="retro truncate text-[10px] text-muted-foreground">@{user.username}</p>
										)}
									</div>

									<Link
										href="/dashboard"
										role="menuitem"
										onClick={() => setUserOpen(false)}
										className="retro flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted"
									>
										<Grid2x22 width={16} height={16} aria-hidden />
										Dashboard
									</Link>

									{needsOnboarding && (
										<Link
											href="/onboarding"
											role="menuitem"
											onClick={() => setUserOpen(false)}
											className="retro flex items-center gap-2 px-3 py-2 text-xs text-primary transition-colors hover:bg-muted"
										>
											<Flag width={16} height={16} aria-hidden />
											Finish setup
										</Link>
									)}

									<button
										type="button"
										role="menuitem"
										onClick={onSignOut}
										className="retro flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
									>
										<Logout width={16} height={16} aria-hidden />
										Sign out
									</button>
								</div>
							)}
						</div>
					) : (
						<>
							<Link
								href="/signin"
								className="retro hidden rounded-none px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:block"
							>
								Login
							</Link>
							<Link href="/signup" className="hidden sm:block">
								<BrutalButton className="retro px-4 py-2 text-xs">Get Started</BrutalButton>
							</Link>
						</>
					)}

					<button
						type="button"
						onClick={() => setMenuOpen((v) => !v)}
						aria-expanded={menuOpen}
						aria-label="Toggle navigation"
						className="flex size-9 items-center justify-center border-2 border-foreground md:hidden"
					>
						{menuOpen ? (
							<Close width={18} height={18} aria-hidden />
						) : (
							<Menu width={18} height={18} aria-hidden />
						)}
					</button>
				</div>
			</div>

			{menuOpen && (
				<div className="border-t-2 border-foreground/10 md:hidden">
					<ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
						{LINKS.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									onClick={(e) => onAnchorClick(e, link.href)}
									className="retro block px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
								>
									{link.label}
								</a>
							</li>
						))}

						{!isPending && !user && (
							<li className="flex items-center gap-3 border-t border-foreground/10 px-3 pt-3 pb-1 sm:hidden">
								<Link
									href="/signin"
									onClick={() => setMenuOpen(false)}
									className="retro rounded-none px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
								>
									Login
								</Link>
								<Link href="/signup" onClick={() => setMenuOpen(false)}>
									<BrutalButton className="retro px-4 py-2 text-xs">Get Started</BrutalButton>
								</Link>
							</li>
						)}
					</ul>
				</div>
			)}
		</header>
	);
}
