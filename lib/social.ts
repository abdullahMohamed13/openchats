import { authClient } from "./auth-client"
import { toast } from "@/components/ui/8bit/toast"
import { friendlyAuthError } from "./auth-validation"
import type { AuthSetLoading, SocialProviders } from "@/types/auth"

type SocialProps = SocialProviders & {
	callbackURL: "/dashboard" | "/onboarding"
}

export const handleSocialLogin = async ({
	provider,
	callbackURL,
	setLoading,
}: SocialProps & AuthSetLoading) => {
	setLoading?.(true)

	const { error } = await authClient.signIn.social({
		provider,
		callbackURL,
		newUserCallbackURL: "/onboarding",
	})

	// Success navigates away to the provider, so the loading state stays on to
	// stop the button flickering back to idle during the redirect.
	if (error) {
		setLoading?.(false)
		toast(friendlyAuthError(error.message) ?? "Login failed")
	}
}
