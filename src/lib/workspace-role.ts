import type { WorkspaceRole } from "@/types/chat";

export function roleLabel(role: WorkspaceRole): string {
	if (role === "owner") return "Owner";
	if (role === "admin") return "Admin";
	return "Member";
}
