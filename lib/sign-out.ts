import { authClient } from "./auth-client";
import type { useRouter } from "next/navigation";

export const handleSignOut = async (router: ReturnType<typeof useRouter>) => {
  // Let StreamChatProvider disconnect after the chat UI has unmounted. Calling
  // client.disconnectUser() here tears the client down while channels are still
  // mounted, which makes Stream throw "can't use a channel after
  // client.disconnect() was called" during the sign-out transition.
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.replace("/signin");
        router.refresh();
      },
    },
  });
};