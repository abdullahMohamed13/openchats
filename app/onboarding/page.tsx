import type { Metadata } from "next";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
	title: "Onboarding",
	description: "Complete setting up your OpenChats profile"
};

export default function OnboardingPage() {
	return (
		<main
			className="flex-col-center relative min-h-svh w-full px-4 py-8"
			style={{
				backgroundImage: "url('/mill-and-flying-saucer.webp')",
				backgroundSize: "cover",
				backgroundPosition: "left",
			}}
		>
			<div aria-hidden className="absolute inset-0 bg-background/90" />
			<div className="relative z-10">
				<OnboardingGuard>
					<OnboardingWizard />
				</OnboardingGuard>
			</div>
		</main>
	);
}

