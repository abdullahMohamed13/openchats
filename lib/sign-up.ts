import { authClient } from './auth-client';
import { ErrorContext } from 'better-auth/react';
import { SignUpProps } from '@/types/auth';

// Show Loading
const onRequest = () => {
}

//redirect to the dashboard or sign in page
const onSuccess = () => {
}

const onError = (ctx: ErrorContext) => {
}

export const handleSignup = async ({ email, password, name, image, callbackURL} : SignUpProps) => {
	
	const { data, error } = await authClient.signUp.email({
		email,
		password,
		name,
		image,
		callbackURL,
	},
	{
		onRequest,
		onSuccess,
		onError,
	})
}
