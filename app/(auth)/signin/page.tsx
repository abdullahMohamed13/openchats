import type { Metadata } from "next";
import AuthSwitch from "@/components/auth/AuthSwitch";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to OpenChats and jump back into your workspaces, channels, and direct messages."
};

type SignInPageProps = {
	searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

function safeCallbackUrl(value: string | string[] | undefined): string {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
	return "/chat";
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
	const params = await searchParams;
	return (
		<AuthSwitch
			initialMode="sign-in"
			callbackURL={safeCallbackUrl(params.callbackUrl)}
		/>
	);
}
