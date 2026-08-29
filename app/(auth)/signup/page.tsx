import type { Metadata } from "next";
import AuthSwitch from "@/components/ui/auth-switch";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create your free OpenChats account and set up a workspace for your team, club, or community in seconds."
};

export default function SignUpPage() {
	return <AuthSwitch initialMode="sign-up" />
}
