"use client"

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
	const [response, setResponse] = useState<string>("Go Back Home Boy!")

	useEffect(() => {
		fetch('https://uselessfacts.jsph.pl/api/v2/facts/random').
		then(res => res.json()).
		then(data => setResponse(data.text))
	}, [])
	
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
				<p className="font-bold max-w-3xl">{response}</p>
			</div>
			<Link href="/">
				<button className="text-primary underline cursor-pointer" aria-label="Go Home Button">Go Home</button>
			</Link>
		</section>
	);
}
