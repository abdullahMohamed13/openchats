import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		local: {
			schema: authSchema,
		},
	}
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
	return {
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
		},
		user: {
			additionalFields: {
				callEnabled: {
					type: "boolean",
					required: false,
				},
				phone: {
					type: "string",
					required: false,
				},
				phoneVerified: {
					type: "boolean",
					required: false,
				},
				badge: {
					type: "string",
					required: false,
				},
				gender: {
					type: "string",
					required: false,
				},
			},
		},
		plugins: [convex({ authConfig })],
	} satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth(createAuthOptions(ctx));
