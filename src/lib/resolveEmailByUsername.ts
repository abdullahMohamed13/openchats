const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

export async function resolveEmailByUsername(username: string): Promise<string | null> {
	const res = await fetch(`${CONVEX_URL}/api/query`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			path: "auth_queries:getEmailByUsername",
			args: { username },
			format: "json",
		}),
	});
	
	const data = await res.json();
	
	if (data.status !== "success") return null;
	return data.value as string;
}
