import StreamChatProvider from "@/providers/StreamChatProvider";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <StreamChatProvider>{children}</StreamChatProvider>;
}
