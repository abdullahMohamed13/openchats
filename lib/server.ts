import { auth } from "./auth";
import { SignInProps } from '@/types/auth'

export const signIn = async ({
  email,
  password,
}: SignInProps) => {
  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true,
  })

  return response
}