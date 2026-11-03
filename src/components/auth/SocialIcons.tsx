import { SocialIconsProps } from "@/types/social";
import { SocialButton } from "./SocialButton";
import { Google, Github } from "pixelarticons/react";

export function SocialIcons({ disabled, pendingProvider, onSelect }: SocialIconsProps) {
  return (
    <>
      <SocialButton
        provider="google"
        name="Google"
        icon={<Google width={20} height={20} />}
        disabled={disabled}
        pending={pendingProvider === "google"}
        onSelect={onSelect}
      />
      <SocialButton
        provider="github"
        name="GitHub"
        icon={<Github width={20} height={20} />}
        disabled={disabled}
        pending={pendingProvider === "github"}
        onSelect={onSelect}
      />
    </>
  );
}