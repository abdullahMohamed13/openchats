import Image from "next/image";
import { ArrowRight, Copy, Message, Send, Users } from "pixelarticons/react";

export default function StepVisual({ id }: { id: number }) {
	if (id === 1) return <WorkspaceVisual />;
	if (id === 2) return <InviteVisual />;
	return <ChatVisual />;
}

function WorkspaceVisual() {
	return (
		<div className="flex flex-col gap-5">
			<div>
				<p className="font-press-start text-[9px] uppercase tracking-wider text-foreground/40">Step 01</p>
				<h3 className="mt-2 text-lg font-bold md:text-xl">Create your workspace</h3>
			</div>

			<div className="border-2 border-foreground/20">
				<div className="border-b-2 border-foreground/20 px-3 py-2.5">
					<p className="font-quera text-[9px] uppercase tracking-[0.18em] text-foreground/50">Workspace name</p>
					<p className="mt-1 text-sm font-bold">
						Acme Studio<span className="text-accent">_</span>
					</p>
				</div>
				<div className="flex items-center gap-2 px-3 py-2.5">
					<Users width={14} height={14} aria-hidden className="shrink-0 text-foreground/50" />
					<p className="text-xs text-foreground/50">Just you for now — invite the team next</p>
				</div>
			</div>

			<div className="flex w-fit items-center gap-2 bg-primary px-4 py-2 text-xs font-bold text-foreground">
				Create workspace
				<ArrowRight width={14} height={14} aria-hidden />
			</div>
		</div>
	);
}

function InviteVisual() {
	const members = [
		"/images/characters/transparent/attidute.png",
		"/images/characters/transparent/banana.png",
		"/images/characters/transparent/batman-2.png"
	];

	return (
		<div className="flex flex-col gap-5">
			<div>
				<p className="font-press-start text-[9px] uppercase tracking-wider text-foreground/40">Step 02</p>
				<h3 className="mt-2 text-lg font-bold md:text-xl">Invite your people</h3>
			</div>

			<div className="flex items-center justify-between gap-3 border-2 border-dashed border-foreground/30 px-3 py-2.5">
				<p className="truncate font-quera text-xs text-foreground/70">openchats.app/invite/x7k2</p>
				<span className="flex shrink-0 items-center gap-1.5 bg-accent px-2.5 py-1 text-[10px] font-bold text-background">
					<Copy width={12} height={12} aria-hidden />
					Copy
				</span>
			</div>

			<div className="flex items-center gap-3">
				<div className="flex space-x-2">
					{members.map((character) => (
						<span
							key={character}
							className="size-12 overflow-hidden border-2 border-background"
						>
							<Image src={character} alt="Character image" width={70} height={70} className="size-full object-cover" />
						</span>
					))}
				</div>
				<p className="text-xs text-foreground/60">3 people joined</p>
			</div>
		</div>
	);
}

function ChatVisual() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-press-start text-[9px] uppercase tracking-wider text-foreground/40">Step 03</p>
					<h3 className="mt-2 text-lg font-bold md:text-xl">Start conversations</h3>
				</div>
				<span className="shrink-0 border-2 border-foreground/25 px-2 py-1 font-quera text-[10px]"># general</span>
			</div>

			<div className="flex flex-col gap-2.5">
				<div className="flex items-start gap-2.5">
					<span className="flex size-7 shrink-0 items-center justify-center bg-accent font-quera text-[9px] font-bold text-background">
						SR
					</span>
					<div className="border-2 border-foreground/15 bg-muted/40 px-3 py-2">
						<p className="font-quera text-[9px] text-foreground/50">Sara · 10:24</p>
						<p className="mt-0.5 text-xs">Standup notes are in the channel.</p>
					</div>
				</div>

				<div className="flex items-start gap-2.5">
					<span className="flex size-7 shrink-0 items-center justify-center bg-primary font-quera text-[9px] font-bold text-foreground">
						YO
					</span>
					<div className="border-2 border-foreground/15 bg-muted/40 px-3 py-2">
						<p className="font-quera text-[9px] text-foreground/50">You · 10:26</p>
						<p className="mt-0.5 text-xs">Reviewing now — good stuff.</p>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 border-2 border-foreground/20 px-3 py-2">
				<Message width={14} height={14} aria-hidden className="text-foreground/50" />
				<p className="text-xs text-foreground/50">Message #general</p>
				<Send width={14} height={14} aria-hidden className="ml-auto text-accent" />
			</div>
		</div>
	);
}
