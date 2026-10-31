import { authClient } from "./auth-client";
import type { useRouter } from "next/navigation";

async function disconnectStream(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!apiKey) return;

  try {
    // Loaded lazily so public pages do not pull in the Stream Chat bundle.
    const { StreamChat } = await import("stream-chat");
    const client = StreamChat.getInstance(apiKey);
    if (client.userID) await client.disconnectUser();
  } catch {
    // A failed chat disconnect must never block signing out.
  }
}

export const handleSignOut = async (router: ReturnType<typeof useRouter>) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: async () => {
        await disconnectStream();
        router.push("/signin");
      },
    },
  });
};