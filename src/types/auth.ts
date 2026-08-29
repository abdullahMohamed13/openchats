type AuthCredentials = {
  email: string
  password: string
}

export type CallbackURLs = {
	callbackURL: "/onboarding"
}

export type AuthSetLoading = {
	setLoading?: (v:boolean) => void,
}

export type SignInProps = AuthCredentials & CallbackURLs & AuthSetLoading;

export type SignUpProps = {
	name: string,
	image?: string,
} & AuthCredentials & CallbackURLs & AuthSetLoading

export type SocialProviders = {
	provider: "github" | "google"
}
