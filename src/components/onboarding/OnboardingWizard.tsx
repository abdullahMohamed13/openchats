"use client";

import { authClient } from "@/lib/auth-client";
import { GuestSetup } from "./GuestSetup";
import { OnboardingFlow } from "./OnboardingFlow";

export default function OnboardingWizard() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) return null;
	if (!session) return null;

	// Guests are auto-onboarded by the setupGuest action; skip the wizard.
	if (session.user.isAnonymous) {
		return <GuestSetup />;
	}

	return (
		<OnboardingFlow
			userId={session.user.id}
			initialName={session.user.name}
		/>
	);
}
