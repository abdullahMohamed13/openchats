import { SocialButtonProps } from "@/types/social";
import { Loading } from "pixelarticons/react";

export function SocialButton({ provider, name, icon, disabled, pending, onSelect }: SocialButtonProps) {
  return (
    <button
      type="button"
      className="social-icon"
      onClick={() => onSelect(provider)}
      disabled={disabled}
      aria-label={`Continue with ${name}`}
      aria-busy={pending || undefined}
    >
      {pending ? <Loading width={20} height={20} className="animate-spin" /> : icon}
      <span>{name}</span>
    </button>
  );
}