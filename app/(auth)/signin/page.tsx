import type { Metadata } from "next";
import AuthSwitch from "@/components/ui/auth-switch";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to OpenChats and jump back into your workspaces, channels, and direct messages."
};

export default function SignInPage() {
	return <AuthSwitch initialMode="sign-in" />;
}
