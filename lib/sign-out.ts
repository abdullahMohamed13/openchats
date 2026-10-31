import { authClient } from "./auth-client";
import type { useRouter } from "next/navigation";

async function disconnectStream(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!apiKey) return;

  try {
    // Loaded lazily so public pages do not pull in the Stream Chat bundle.
    const { StreamChat } = await import("stream-chat");
    const client = StreamChat.getInstance(apiKey);
    if (client.userID) {
      // Suppress "channel after disconnect" errors during cleanup
      await client.disconnectUser().catch((err) => {
        if (err instanceof Error && !err.message.includes("can't use a channel after client.disconnect")) {
          console.warn("Stream disconnect error:", err);
        }
      });
    }
  } catch {
    // A failed chat disconnect must never block signing out.
  }
}

export const handleSignOut = async (router: ReturnType<typeof useRouter>) => {
  // Disconnect Stream first to avoid "channel after disconnect" errors
  // when React components unmount during the sign-out transition.
  await disconnectStream();
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/signin");
      },
    },
  });
};