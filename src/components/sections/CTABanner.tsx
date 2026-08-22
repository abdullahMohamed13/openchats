"use client"

import { CTABanner } from "@/components/ui/banner"
import { useRouter } from "next/navigation"

export default function CTABannerSection() {
  const router = useRouter()
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center bg-background p-8">
      <CTABanner
        className="w-full max-w-2xl"
        variant="highlight"
        title="Ready to Connect?"
        description="Your team deserves better conversations. Set up your workspace and start chatting in under a minute."
        buttonAction={{ label: "Get Started", onClick: () => router.push('/login') }}
      />
    </div>
  )
}