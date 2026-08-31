"use client"

import { Skeleton } from "@/components/ui/8bit/skeleton";
import { useRandomFact } from "@/hooks/useRandomFact";
import Link from "next/link";

export default function NotFound() {
	const {fact, loading} = useRandomFact()
	
	return (
		<section className="min-h-screen flex-col-center gap-4 px-6 text-center"
			style={{
				backgroundImage: "url('/not-found.webp')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<h1 className="font-press-start text-6xl md:text-7xl font-bold">404</h1>
			<p className="text-foreground/50">Sorry bro for disappointing you, this page does not exist :(</p>

			<div>
				<h3 className="mb-2 text-secondary">Here{"'"}s your random fact:</h3>
				{
					loading ? 
						<Skeleton /> :
						<p className="font-bold max-w-3xl">{fact}</p>
				}
			</div>
			<Link href="/">
				<button className="text-primary underline cursor-pointer" aria-label="Go Home Button">Go Home</button>
			</Link>
		</section>
	);
}
