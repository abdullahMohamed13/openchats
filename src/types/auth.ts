type AuthCredentials = {
  email: string
  password: string
}

export type CallbackURLs = {
	callbackURL: "/onboarding"
}

export type SignInProps = AuthCredentials & CallbackURLs;

export type SignUpProps = {
	name: string,
	image?: string,
} & AuthCredentials & CallbackURLs

export type SocialProviders = {
	provider: "github" | "google"
}
