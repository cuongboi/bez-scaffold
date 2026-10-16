import { betterAuth } from "better-auth";
import { dbAdapter } from "./db";
import { admin, bearer, jwt, openAPI } from "better-auth/plugins";
import { env } from "@/env";

export const auth = betterAuth({
  database: dbAdapter,
  baseURL: env.BETTER_AUTH_URL,
  basePath: env.BETTER_AUTH_BASE_PATH,
  plugins: [
    jwt({
      jwks: { jwksPath: "/.well-known/jwks.json" },
      jwt: { expirationTime: "15m" },
    }),
    admin(),
    bearer(),
    openAPI(),
  ],
  trustedOrigins: env.WEB_ORIGIN?.split(",") || [],
  session: {
    // Sliding idle timeout: each request within updateAge extends the session by expiresIn.
    expiresIn: 60 * 60,
    updateAge: 60,
    cookieCache: { enabled: true, strategy: 'jwt', maxAge: 60 },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    revokeSessionsOnPasswordReset: true,
    // TODO: send a real email. Until then the reset link is printed to the API console.
    sendResetPassword: async ({ user, url }) => {
      console.info(`[auth] Password reset for ${user.email}: ${url}`);
    },
  },
});


export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session['user'];
