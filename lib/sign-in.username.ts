import type { ErrorContext } from "better-auth/react";
import { authClient } from "./auth-client";
import { toast } from "@/components/ui/8bit/toast";
import { friendlyAuthError } from "./auth-validation";
import type { UsernameSignInProps } from "@/types/auth";
import { signInByUsername } from "@/lib/sign-in-by-username";

export const handleUsernameSignIn = async ({ username, password, callbackURL, setLoading }: UsernameSignInProps) => {

	setLoading?.(true);
	const result = await signInByUsername(username.trim(), password);

	if (!result.ok) {
		setLoading?.(false);
		toast(result.error);
		return;
	}

	if (!result.email) {
		setLoading?.(false);
		toast("No account found with that username :)");
		return;
	}

	await authClient.signIn.email(
		{
			email: result.email,
			password,
			callbackURL,
			rememberMe: true,
		},
		{
			onRequest: () => setLoading?.(true),
			onSuccess: () => setLoading?.(false),
			onError: (ctx: ErrorContext) => {
				setLoading?.(false);
				toast(friendlyAuthError(ctx.error.message) ?? "Something went wrong");
			},
		}
	);
};
