import { authClient } from "./auth-client"
import { toast } from "@/components/ui/8bit/toast"
import type { ErrorContext } from "better-auth/react"
import type { SocialProviders, CallbackURLs, AuthSetLoading } from "@/types/auth"

export const handleSocialLogin = async ({
	provider,
	callbackURL,
	setLoading,
}: SocialProviders & CallbackURLs & AuthSetLoading) => {
	return authClient.signIn.social(
		{
			provider,
			callbackURL,
			newUserCallbackURL: "/onboarding",
		},
		{
			onRequest: () => setLoading?.(true),
			onError: (ctx: ErrorContext) => {
				setLoading?.(false)
				toast(ctx.error.message ?? "Login failed")
			},
		}
	)
}