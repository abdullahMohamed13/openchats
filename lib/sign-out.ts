import { authClient } from "./auth-client";

export const handleSignOut = async () => {
  // Let StreamChatProvider disconnect after the chat UI has unmounted. Calling
  // client.disconnectUser() here tears the client down while channels are still
  // mounted, which makes Stream throw "can't use a channel after
  // client.disconnect() was called" during the sign-out transition.
  await authClient.signOut();

  // A full navigation (rather than a client-side transition) clears any stale
  // session state left in the app and prevents the signed-out UI from flashing
  // before the sign-in page loads.
  window.location.replace("/signin");
};
