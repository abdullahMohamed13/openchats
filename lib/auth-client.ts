import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
	anonymousClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "../convex/betterAuth/auth";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		convexClient(),
		anonymousClient(),
	],
});
