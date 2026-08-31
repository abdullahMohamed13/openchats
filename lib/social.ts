import { authClient } from "./auth-client"
import { toast } from "@/components/ui/8bit/toast"
import type { ErrorContext } from "better-auth/react"
import type { SocialProviders } from "@/types/auth"

type SocialProps = SocialProviders & {
	callbackURL: "/dashboard" | "/onboarding"
}

export const handleSocialLogin = async ({
	provider,
	callbackURL,
}: SocialProps) => {
	return authClient.signIn.social(
		{
			provider,
			callbackURL,
			newUserCallbackURL: "/onboarding",
		},
		{
			onError: (ctx: ErrorContext) => {
				toast(ctx.error.message ?? "Login failed")
			},
		}
	)
}