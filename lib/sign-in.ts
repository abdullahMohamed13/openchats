import type { ErrorContext } from "better-auth/react";
import { authClient } from "./auth-client";
import { toast } from "@/components/ui/8bit/toast";
import type { SignInProps, AuthSetLoading } from '@/types/auth'

export const handleSignIn = async ({ email, password, callbackURL, setLoading }: SignInProps & AuthSetLoading) => {
	await authClient.signIn.email(
		{
			email,
			password,
			callbackURL,
			rememberMe: true
		},
		{
			onRequest: () => setLoading?.(true),
			onSuccess: () => setLoading?.(false),
			onError: (ctx: ErrorContext) => {
				setLoading?.(false)
				toast(ctx.error.message ?? "Something went wrong")
			},
		}
	)
}