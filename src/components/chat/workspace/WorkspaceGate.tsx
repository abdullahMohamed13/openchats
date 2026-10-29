"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/8bit/button";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import Image from "next/image";

export function WorkspaceGate() {
	const router = useRouter();
	const workspaces = useQuery(api.workspaces.listMyWorkspaces);
	const [createOpen, setCreateOpen] = useState(false);

	const firstWorkspace = workspaces?.[0];

	useEffect(() => {
		if (firstWorkspace) {
			router.replace(`/w/${firstWorkspace._id}`);
		}
	}, [firstWorkspace, router]);

	if (workspaces === undefined) {
		return (
			<main className="flex min-h-screen w-full items-center justify-center bg-background text-sm text-muted-foreground">
				Loading workspaces…
			</main>
		);
	}

	if (firstWorkspace) {
		return (
			<main className="flex min-h-screen w-full items-center justify-center bg-background text-sm text-muted-foreground">
				Opening {firstWorkspace.name}…
			</main>
		);
	}

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
			<div
				className="pointer-events-none absolute inset-0 opacity-20"
				style={{
					backgroundImage:
						"linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
				aria-hidden
			/>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="relative w-full max-w-lg border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_var(--border)]"
			>
				<div className="flex-center gap-2">
					<Image
						src="logo.webp"
						alt="Openchats logo"
						width={50}
						height={50}
						className="rounded-full object-cover"
					/>
					<p className="font-press-start text-xs uppercase tracking-widest text-primary">
						OpenChats
					</p>
				</div>
				<h1 className="mt-4 font-press-start text-xl uppercase leading-relaxed">
					Build your first workspace
				</h1>
				<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
					Workspaces keep channels, conversations, and people together. Create
					one to start chatting.
				</p>

				<Button
					type="button"
					onClick={() => setCreateOpen(true)}
					className="mt-8 h-11 w-full text-sm uppercase"
				>
					Create workspace
				</Button>
			</motion.div>

			{createOpen && (
				<CreateWorkspaceDialog onClose={() => setCreateOpen(false)} />
			)}
		</main>
	);
}
