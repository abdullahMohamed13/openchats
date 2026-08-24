import type { Metadata } from "next";
import SignUpForm from "./signup-form";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create your free OpenChats account and set up a workspace for your team, club, or community in seconds."
};

export default function SignUpPage() {
	return <SignUpForm />
}
