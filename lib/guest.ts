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
				// A full reload makes sure the new session is picked up before the
				// onboarding guard runs.
				// eslint-disable-next-line @next/next/no-location-assign-relative-destination
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
