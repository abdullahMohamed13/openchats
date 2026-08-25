import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
	title: "Log In",
	description: "Log in to OpenChats and jump back into your workspaces, channels, and direct messages."
};

export default function LoginPage() {
	return <LoginForm />
}
