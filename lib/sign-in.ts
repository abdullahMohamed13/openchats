import { authClient } from "./auth-client";
import { SignInProps } from '@/types/auth'

export const handleSignIn = async ({email, password, callbackURL}: SignInProps) => {
	const {data, error} = await authClient.signIn.email({
		email, password, callbackURL, rememberMe: true
	})
}
