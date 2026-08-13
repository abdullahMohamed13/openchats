import { authClient } from "./auth-client";
import type { useRouter } from "next/navigation";

export const handleSignOut = async (router: ReturnType<typeof useRouter>) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/login");
      },
    },
  });
};