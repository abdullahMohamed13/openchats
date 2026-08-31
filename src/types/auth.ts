type AuthCredentials = {
  email: string
  password: string
}

type AuthSetLoading = {
	setLoading?: (v:boolean) => void,
}

type SignInProps = AuthCredentials & AuthSetLoading & {
	callbackURL: "/dashboard"
};

type SignUpProps = {
	name: string,
	image?: string,
	callbackURL: "/onboarding"
} & AuthCredentials & AuthSetLoading

type SocialProviders = {
	provider: "github" | "google"
}

type UsernameSignInProps = AuthSetLoading & {
	username: string;
	password: string;
	callbackURL: "/dashboard";
};

export type { SocialProviders, AuthSetLoading, SignInProps, SignUpProps, UsernameSignInProps }