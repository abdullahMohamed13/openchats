import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
  plugins: [
    // plugins
		dash({
			apiKey: process.env.BETTER_AUTH_API_KEY
    })
  ]
})