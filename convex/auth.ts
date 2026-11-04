import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { APIError } from "better-auth/api";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { anonymous } from "better-auth/plugins/anonymous";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";
import { sendPasswordResetEmail, toSiteUrl } from "./email";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		local: {
			schema: authSchema,
		},
	}
);

const dynamicBaseURL = {
	allowedHosts: [
		"localhost",
		"localhost:3000",
		"127.0.0.1",
		"127.0.0.1:3000",
		"openchats.qzz.io",
	],
	fallback: siteUrl,
};

export const createAuthOptions = (convexCtx: GenericCtx<DataModel>) => {
	return {
		baseURL: dynamicBaseURL,
		database: authComponent.adapter(convexCtx),
		trustedOrigins: [
			siteUrl,
			"http://localhost:3000",
			"http://localhost:4173",
			"http://127.0.0.1:3000",
		].filter(Boolean) as string[],
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ user, url }) => {
				await sendPasswordResetEmail({
					to: user.email,
					name: user.name,
					url: toSiteUrl(url),
				});
			},
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
				role: {
					type: "string",
					required: false,
				},
				username: {
					type: "string",
					required: false,
				},
				onboarded: {
					type: "boolean",
					required: false,
					defaultValue: false,
				},
			},
		},
		databaseHooks: {
			user: {
				update: {
					before: async (_data, context) => {
						if (context?.context.session?.user?.isAnonymous) {
							throw APIError.from("FORBIDDEN", {
								code: "GUEST_PROFILE_LOCKED",
								message: "Create an account to change your profile.",
							});
						}
					},
				},
			},
		},
		plugins: [
			convex({ authConfig }),
			anonymous({
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					try {
						const actionCtx = requireActionCtx(convexCtx);
						const { sharedWorkspaceId, privateWorkspaceId } =
							await actionCtx.runMutation(
								internal.guest.linkGuestToAccount,
								{
									anonymousUserId: anonymousUser.user.id,
									newUserId: newUser.user.id,
								},
							);

						await actionCtx.runAction(internal.guest.finalizeGuestUpgrade, {
							anonymousUserId: anonymousUser.user.id,
							newUserId: newUser.user.id,
							newUserName:
								newUser.user.name?.trim() ||
								newUser.user.username ||
								newUser.user.email ||
								newUser.user.id,
							newUserImage: newUser.user.image ?? undefined,
							sharedWorkspaceId: sharedWorkspaceId ?? undefined,
							privateWorkspaceId: privateWorkspaceId ?? undefined,
						});
					} catch (error) {
						console.error("Failed to migrate guest data in onLinkAccount", error);
					}
				},
			}),
		],
	} satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth(createAuthOptions(ctx));
