"use client"

import { useEffect, useState } from "react"

export function useRandomFact(fallback: string = "Get Back Home Boy!") {
	const [fact, setFact] = useState(fallback);
	const [loading, setLoading] = useState<boolean>(true);
	
	useEffect(() => {
		fetch('https://uselessfacts.jsph.pl/api/v2/facts/random').
			then(res => res.json()).
			then(data => setFact(data.text)).
			catch(() => { }).
			finally(() => setLoading(false))
	}, [])

	return {fact, loading}
}