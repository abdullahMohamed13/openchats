"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import BrutalButton from "./brutal-button"

interface CTABannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  buttonAction?: { label: string; onClick?: () => void }
  variant?: "default" | "highlight"
}

export function CTABanner({
  title,
  description,
  buttonAction,
  variant = "default",
  className,
  ...props
}: CTABannerProps) {
  return (
    <div
      data-slot="tron-cta-banner"
      className={cn(
        "group relative overflow-hidden rounded border bg-card/80 px-6 py-8 text-center backdrop-blur-sm",
        variant === "highlight"
          ? "border-primary/50"
          : "border-primary/20",
        className
      )}
      {...props}
    >
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />

      {/* Animated top border glow */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px">
        <div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          style={{ animation: "ctaSweep 4s ease-in-out infinite" }}
        />
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="font-press-start text-lg font-bold uppercase tracking-wider text-foreground md:text-xl">
          {title}
        </h3>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60">
            {description}
          </p>
        )}

        {/* Actions */}
        {buttonAction && (
          <div className="mt-5 flex items-center justify-center">
            {buttonAction && (
              <BrutalButton
                onClick={buttonAction.onClick}
                className="rounded border border-primary/30 px-5 py-2 uppercase tracking-widest text-foreground/90!"
              >
                {buttonAction.label}
              </BrutalButton>
            )}
          </div>
        )}
      </div>

      {/* Corner decorations */}
      <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-primary/40" />
      <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-primary/40" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-primary/40" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-primary/40" />
    </div>
  )
}

export default CTABanner;
