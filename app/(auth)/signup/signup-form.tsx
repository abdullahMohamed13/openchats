"use client";

import { authClient } from "@/lib/auth-client";
import { handleSignup } from "@/lib/sign-up";

const email = "abdllahahabm@gmail.com"
const password = '11111111'
const name = 'Abdallah Aziz 2'

// const { data: session, isPending } = authClient.useSession();  // reactive

export default function SignUpForm() {
	return (
		<button className="bg-white p-4 text-black cursor-pointer"
			onClick={() => handleSignup({ email, password, name, callbackURL: "/onboarding" })}
		>
			Sign Up
		</button>
	)
}
