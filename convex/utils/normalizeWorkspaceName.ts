export function normalizeWorkspaceName(value: string): string {
	const trimmed = value.trim().replace(/\s+/g, " ");
	if (trimmed.length < 2 || trimmed.length > 50) {
		throw new Error("Workspace name must be between 2 and 50 characters");
	}
	return trimmed;
}