"use client";

import { useRouter } from "next/navigation";
import { Logout } from "pixelarticons/react";
import { cn } from "@/lib/utils";
import { handleSignOut } from "@/lib/sign-out";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => handleSignOut(router)}
      aria-label="Sign out"
      className={cn("flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground", className)}
    >
      <Logout width={16} height={16} aria-hidden />
      {children ?? "Sign out"}
    </button>
  );
}