import type { ErrorContext } from "better-auth/react";
import { authClient } from "./auth-client";
import { toast } from "@/components/ui/8bit/toast";
import { friendlyAuthError } from "./auth-validation";
import type { AuthSetLoading } from "@/types/auth";

export const handleGuestSignIn = async ({ setLoading }: AuthSetLoading) => {
	await authClient.signIn.anonymous({
		fetchOptions: {
			onRequest: () => setLoading?.(true),
			onSuccess: () => {
				setLoading?.(false);
				// The guest setup will be handled by OnboardingWizard component
				window.location.assign("/onboarding");
			},
			onError: (ctx: ErrorContext) => {
				setLoading?.(false);
				toast(
					friendlyAuthError(ctx.error.message) ??
						"Could not start a guest session. Please try again.",
				);
			},
		},
	});
};