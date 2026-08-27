import type { Metadata } from "next";
import SignInForm from "./signin-form";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to OpenChats and jump back into your workspaces, channels, and direct messages."
};

export default function SignInPage() {
	return <SignInForm />
}
