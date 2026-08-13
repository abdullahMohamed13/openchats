import { authClient } from '@/lib/auth-client';
import { ErrorContext } from 'better-auth/react'; // RequestContext, SuccessContext
import { SignUpProps } from '@/types/auth';

// Show Loading
const onRequest = () => {
	console.log(`loading`)
}

//redirect to the dashboard or sign in page
const onSuccess = () => {
	console.log(`Success`)
}

const onError = (ctx: ErrorContext) => {
	alert(ctx.error.message)
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
