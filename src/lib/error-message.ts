export function getErrorMessage(cause: unknown, fallback: string): string {
	if (cause && typeof cause === "object") {
		const data = (cause as { data?: unknown }).data;
		if (typeof data === "string" && data.trim()) return data.trim();
		if (data && typeof data === "object" && "message" in data) {
			const message = (data as { message?: unknown }).message;
			if (typeof message === "string" && message.trim()) return message.trim();
		}
	}

	if (cause instanceof Error) {
		const match = cause.message.match(
			/Uncaught Error:\s*([\s\S]*?)(?:\s+at handler\s*\(|$)/,
		);
		if (match?.[1]?.trim()) return match[1].trim();
		return cause.message;
	}

	return fallback;
}
