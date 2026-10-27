import type { Metadata } from "next";
import AuthSwitch from "@/components/auth/auth-switch";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create your free OpenChats account and set up a workspace for your team, club, or community in seconds."
};

type SignUpPageProps = {
	searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

function safeCallbackUrl(value: string | string[] | undefined): string {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
	return "/chat";
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
	const params = await searchParams;
	return (
		<AuthSwitch
			initialMode="sign-up"
			callbackURL={safeCallbackUrl(params.callbackUrl)}
		/>
	);
}
