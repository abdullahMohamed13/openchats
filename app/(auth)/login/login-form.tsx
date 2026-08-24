"use client";

import { handleSignup } from "@/lib/sign-up";

const email = "abdullah.229op@gmail.com"
const password = '11111111'
const name = 'Abdallah Mohamed'

export default function LoginForm() {
	return (
		<button className="bg-white p-4 text-black cursor-pointer"
			onClick={() => handleSignup({ email, password, name, callbackURL: "/onboarding" })}
		>
			login
		</button>
	)
}
