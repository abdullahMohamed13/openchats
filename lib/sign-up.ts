import { authClient } from './auth-client';
import type { ErrorContext } from 'better-auth/react';
import { toast } from '@/components/ui/8bit/toast';
import type { SignUpProps, AuthSetLoading } from '@/types/auth';

export const handleSignup = async ({ email, password, name, image, callbackURL, setLoading }: SignUpProps & AuthSetLoading) => {
	await authClient.signUp.email(
		{
			email,
			password,
			name,
			image,
			callbackURL,
		},
		{
			onRequest: () => setLoading?.(true),
			onSuccess: () => {
				setLoading?.(false)
				window.location.assign(callbackURL)
			},
			onError: (ctx: ErrorContext) => {
				setLoading?.(false)
				toast(ctx.error.message ?? "Something went wrong")
			},
		}
	)
}