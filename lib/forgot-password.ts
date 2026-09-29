import { authClient } from "./auth-client";
import { convex } from "@/lib/convex-client";
import { api } from "../convex/_generated/api";
import { toast } from "@/components/ui/8bit/toast";
import { friendlyAuthError } from "./auth-validation";
import type { ForgotPasswordProps } from "@/types/auth";

export const handleForgotPassword = async ({ email, setLoading }: ForgotPasswordProps) => {
	setLoading?.(true);

	try {
		const exists = await convex.query(api.auth_queries.accountEmailExists, {
			email: email.trim(),
		});

		if (!exists) {
			toast("No account found with that email address.");
			return false;
		}

		const { error } = await authClient.requestPasswordReset({
			email: email.trim(),
			redirectTo: "/reset-password",
		});

		if (error) {
			toast(friendlyAuthError(error.message) ?? "Something went wrong");
			return false;
		}

		toast("Reset link sent. Check your inbox.");
		return true;
	} catch {
		toast("Something went wrong. Please try again.");
		return false;
	} finally {
		setLoading?.(false);
	}
};
