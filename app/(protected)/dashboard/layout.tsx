import StreamChatProvider from "@/providers/StreamChatProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <StreamChatProvider>{children}</StreamChatProvider>;
}
