import { authClient } from "./auth-client"
import { SocialProviders, CallbackURLs } from "@/types/auth"

export const handleSocialLogin = async ({
	provider,
	callbackURL,
}: SocialProviders & CallbackURLs) => {
  return authClient.signIn.social({
    provider,
		callbackURL,
		newUserCallbackURL: "/onboarding",
  })
}