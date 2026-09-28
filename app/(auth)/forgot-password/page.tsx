import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Request a link to reset your OpenChats password.",
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
