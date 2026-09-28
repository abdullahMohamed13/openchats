import { authClient } from "./auth-client";
import { toast } from "@/components/ui/8bit/toast";
import { friendlyAuthError } from "./auth-validation";
import type { ResetPasswordProps } from "@/types/auth";

export const handleResetPassword = async ({ newPassword, token, setLoading }: ResetPasswordProps) => {
	setLoading?.(true);

	const { error } = await authClient.resetPassword({
		newPassword,
		token,
	});

	setLoading?.(false);

	if (error) {
		toast(friendlyAuthError(error.message) ?? "Something went wrong");
		return false;
	}

	toast("Password updated. You can sign in now.");
	return true;
};
