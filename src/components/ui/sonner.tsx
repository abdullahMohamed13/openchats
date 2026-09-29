"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Check, CircleInfo, SquareAlert, Cancel, Loading } from "pixelarticons/react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: (
          <Check className="size-4" />
        ),
        info: (
          <CircleInfo className="size-4" />
        ),
        warning: (
          <SquareAlert className="size-4" />
        ),
        error: (
          <Cancel className="size-4" />
        ),
        loading: (
          <Loading className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
