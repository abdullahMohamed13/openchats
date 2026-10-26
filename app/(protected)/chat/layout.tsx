import StreamChatProvider from "@/providers/StreamChatProvider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <StreamChatProvider>{children}</StreamChatProvider>;
}
