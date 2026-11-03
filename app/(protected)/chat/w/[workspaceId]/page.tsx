import type { Id } from "@/convex/_generated/dataModel";
import { ChatShell } from "@/components/chat/ChatShell";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  return (
    <ChatShell
      key={workspaceId}
      workspaceId={workspaceId as Id<"workspaces">}
    />
  );
}
