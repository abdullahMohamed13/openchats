import type { ErrorContext } from "better-auth/react";
import { authClient } from "./auth-client";
import { toast } from "@/components/ui/8bit/toast";
import type { UsernameSignInProps } from "@/types/auth";
import { resolveEmailByUsername } from "@/lib/resolveEmailByUsername";

export const handleUsernameSignIn = async ({ username, password, callbackURL, setLoading }: UsernameSignInProps) => {

	setLoading?.(true);
	const email = await resolveEmailByUsername(username);
	
	if (!email) {
		setLoading?.(false);
		toast("No account found with that username :)");
		return;
	}

	await authClient.signIn.email(
		{
			email,
			password,
			callbackURL,
			rememberMe: true,
		},
		{
			onRequest: () => setLoading?.(true),
			onSuccess: () => setLoading?.(false),
			onError: (ctx: ErrorContext) => {
				setLoading?.(false);
				toast(ctx.error.message ?? "Something went wrong");
			},
		}
	);
};
