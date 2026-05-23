'use client';

import { useRouter } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs'

export default function SignInPage() {
	const { signIn, errors, fetchStatus } = useSignIn();
	const router = useRouter();
	
	return <div>
		Signin
	</div>
}