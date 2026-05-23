'use client';

import { useAuth, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
	const { signUp, errors, fetchStatus } = useSignUp();
	const { isSignedIn } = useAuth();
	const router = useRouter();

	return <div>
		Signup
	</div>
}