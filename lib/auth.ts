import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
  emailAndPassword: {    
    enabled: true
	},
	
 	socialProviders: { 
      github: { 
          clientId: process.env.GITHUB_CLIENT_ID!, 
          clientSecret: process.env.GITHUB_CLIENT_SECRET!, 
			},
			google: {
          clientId: process.env.GOOGLE_CLIENT_ID!, 
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
      }
  }, 
	
  plugins: [
		dash({
			apiKey: process.env.BETTER_AUTH_API_KEY
    }),
		// This sets cookies
		nextCookies(),
	]
})