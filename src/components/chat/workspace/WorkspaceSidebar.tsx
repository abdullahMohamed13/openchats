"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Flag, Settings2, MoreVertical, Plus } from "pixelarticons/react";
import { Button } from "@/components/ui/8bit/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { SignOutButton } from "../SignOutButton";
import { WorkspaceAvatar } from "./WorkspaceAvatar";
import type { CurrentUser, WorkspaceSummary } from "@/types/chat";

interface WorkspaceSidebarProps {
	currentUser: CurrentUser;
	workspaces: WorkspaceSummary[];
	activeWorkspaceId: string;
	onCreateWorkspace: () => void;
	onOpenSettings: () => void;
}

export function WorkspaceSidebar({
	currentUser,
	workspaces,
	activeWorkspaceId,
	onCreateWorkspace,
	onOpenSettings,
}: WorkspaceSidebarProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	const needsOnboarding = !isPending && !!session && session.user.onboarded !== true;

	return (
		<aside className="hidden w-16 shrink-0 flex-col items-center gap-3 border-r border-border bg-muted py-4 lg:flex">

			<Image
				src="/logo.webp"
				className="rounded-lg border-2 border-foreground bg-primary font-press-start text-[10px] text-primary-foreground shadow-[2px_2px_0px_var(--foreground)]"
				alt="Openchats logo"
				height={36}
				width={36}
			/>

			<div className="h-px w-8 bg-border" aria-hidden />

			<div className="flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto py-1">
				{workspaces.map((workspace) => {
					const active = workspace._id === activeWorkspaceId;

					return (
						<button
							key={workspace._id}
							type="button"
							onClick={() => router.push(`/w/${workspace._id}`)}
							aria-label={`Open ${workspace.name}`}
							aria-current={active ? "page" : undefined}
							title={workspace.name}
							className={cn(
								"flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 font-press-start text-[10px] uppercase transition-all",
								active
									? "border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--foreground)]"
									: "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
							)}
						>
							<WorkspaceAvatar
								name={workspace.name}
								imageUrl={workspace.imageUrl}
								className="size-full rounded-[6px]"
							/>
						</button>
					);
				})}

				<Button
					type="button"
					onClick={onCreateWorkspace}
					aria-label="Create workspace"
					title="Create workspace"
					variant="ghost"
					size="sm"
					className="size-10 shrink-0 rounded-lg border border-dashed border-border p-0 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
				>
					<Plus width={18} height={18} />
				</Button>
			</div>

			<div className="relative mt-auto flex flex-col items-center gap-3">
				{needsOnboarding && (
					<Button
						type="button"
						onClick={() => router.push("/onboarding")}
						aria-label="Finish your setup"
						title="Finish your setup"
						variant="ghost"
						size="sm"
						className="relative size-9 rounded-lg border border-dashed border-primary p-0 text-primary hover:bg-primary hover:text-primary-foreground"
					>
						<Flag width={18} height={18} />
						<span
							className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-muted bg-accent"
							aria-hidden
						/>
					</Button>
				)}

				<Button
					type="button"
					onClick={onOpenSettings}
					aria-label="Workspace settings"
					title="Workspace settings"
					variant="ghost"
					size="sm"
					className="size-9 rounded-lg p-0 text-muted-foreground hover:bg-background hover:text-foreground"
				>
					<Settings2 width={18} height={18} />
				</Button>

				<div className="relative">
					<button
						type="button"
						onClick={() => setMenuOpen((open) => !open)}
						aria-label="Your profile"
						title={currentUser.name}
						aria-expanded={menuOpen}
						className="relative block"
					>
						<Image
							src={currentUser.avatar}
							alt={currentUser.name}
							width={36}
							height={36}
							className="size-9 rounded-full border-2 border-border object-cover"
						/>
						<span
							className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border border-muted bg-success"
							aria-hidden
						/>
					</button>

					{menuOpen && (
						<>
							<button
								type="button"
								aria-label="Close profile menu"
								className="fixed inset-0 z-40 cursor-default"
								onClick={() => setMenuOpen(false)}
							/>
							<div className="absolute bottom-12 left-10 z-50 flex w-44 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
								<div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
									<Image
										src={currentUser.avatar}
										alt=""
										width={28}
										height={28}
										className="size-7 rounded-full object-cover"
									/>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-foreground">{currentUser.name}</p>
										<p className="truncate text-xs text-muted-foreground">{currentUser.title}</p>
									</div>
								</div>
								<div className="flex flex-col p-1">
									<button
										type="button"
										className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									>
										<MoreVertical width={16} height={16} aria-hidden />
										Edit profile
									</button>
									<SignOutButton className="w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
								</div>
							</div>
						</>
					)}
				</div>
			</div>

		</aside>
	);
}
