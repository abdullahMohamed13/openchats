type AuthCredentials = {
  email: string
  password: string
}

type AuthSetLoading = {
	setLoading?: (v:boolean) => void,
}

type SignInProps = AuthCredentials & AuthSetLoading & {
	callbackURL: string
};

type SignUpProps = {
	name: string,
	image?: string,
	callbackURL: "/onboarding"
} & AuthCredentials & AuthSetLoading

type UsernameSignInProps = AuthSetLoading & {
	username: string;
	password: string;
	callbackURL: string;
};

type ForgotPasswordProps = AuthSetLoading & {
	email: string;
};

type ResetPasswordProps = AuthSetLoading & {
	newPassword: string;
	token?: string;
};

export type { AuthSetLoading, SignInProps, SignUpProps, UsernameSignInProps, ForgotPasswordProps, ResetPasswordProps }
