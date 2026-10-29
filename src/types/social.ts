type SocialProviders = {
	provider: "github" | "google"
}

type SocialProvider = SocialProviders["provider"]

interface SocialButtonProps {
  provider: SocialProvider;
  name: string;
  icon: React.ReactNode;
  disabled: boolean;
  pending: boolean;
  onSelect: (provider: SocialProvider) => void;
}

interface SocialIconsProps {
  disabled: boolean;
  pendingProvider: SocialProvider | null;
  onSelect: (provider: SocialProvider) => void;
}

export type { SocialProviders, SocialProvider, SocialButtonProps, SocialIconsProps}