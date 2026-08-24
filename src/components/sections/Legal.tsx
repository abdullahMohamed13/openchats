import type { ReactNode } from "react";
import { Line } from "@/components/shared/Line";

export type TocItem = {
	id: string;
	label: string;
};

type LegalPageProps = {
	title: string;
	lastUpdated: string;
	toc?: TocItem[];
	children: ReactNode;
};

export function LegalPage({ title, lastUpdated, toc, children }: LegalPageProps) {
	return (
		<main className="section-padding w-full">
			<div className="mx-auto w-full max-w-3xl">
				<div className="mb-4 font-bold flex flex-col items-center md:items-start">
					<p className="text-2xl font-quera">Legal</p>
					<Line className="-mt-4 rotate-179 md:-translate-x-3" width={65} />
					<h1 className="-mt-2 text-3xl md:text-4xl text-center md:text-left">{title}</h1>
					<p className="mt-3 text-xs md:text-sm font-normal text-muted-foreground">Last updated: {lastUpdated}</p>
				</div>

				{toc && toc.length > 0 && (
					<nav aria-label="Table of contents" className="rounded-base border-2 border-accent/10 shadow-shadow bg-card p-5 md:p-6 mb-10">
						<p className="text-lg font-quera text-primary mb-3">On this page</p>
						<ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
							{toc.map((item) => (
								<li key={item.id}>
									<a
										href={`#${item.id}`}
										className="text-sm md:text-base text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
									>
										{item.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				)}

				<div className="space-y-10 md:space-y-12">{children}</div>
			</div>
		</main>
	);
}

type LegalSectionProps = {
	id: string;
	title: string;
	children: ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
	return (
		<section id={id} className="scroll-mt-6 space-y-4">
			<h2 className="text-xl md:text-2xl font-extrabold text-primary">{title}</h2>
			{children}
		</section>
	);
}

export function LegalSubTitle({ children }: { children: ReactNode }) {
	return <h3 className="text-base font-bold text-foreground">{children}</h3>;
}

export function LegalText({ children }: { children: ReactNode }) {
	return <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{children}</p>;
}

export function LegalList({ children }: { children: ReactNode }) {
	return (
		<ul className="space-y-2 pl-5 list-disc marker:text-primary text-sm md:text-base leading-relaxed text-muted-foreground">
			{children}
		</ul>
	);
}
