import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform((v) => (v ? `https://${v}` : undefined)),
    PORT: z.coerce.number().default(3000),
  },
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    ENGINE_API_KEY: z.string(),
    PLAIN_API_KEY: z.string(),
    XAI_API_KEY: z.string(),
    SUPABASE_SERVICE_KEY: z.string(),
    TRIGGER_SECRET_KEY: z.string(),
    TRIGGER_PROJECT_ID: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    UPSTASH_REDIS_REST_URL: z.string(),
    LOOPS_ENDPOINT: z.string(),
    LOOPS_API_KEY: z.string(),
    NOVU_SECRET_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    OPENPANEL_SECRET_KEY: z.string(),
    WEBHOOK_SECRET_KEY: z.string(),
    DUFFEL_TRAVELESE_PRO_ACCESS_TOKEN: z.string(),
    DUFFEL_TRAVELESE_PRO_WEBHOOK_SECRET: z.string(),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER: z.string(),
    NEXT_PUBLIC_SUPABASE_ID: z.string(),
    NEXT_PUBLIC_PLAID_ENVIRONMENT: z.string(),
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    ENGINE_API_KEY: process.env.ENGINE_API_KEY,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ID: process.env.NEXT_PUBLIC_SUPABASE_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_PLAID_ENVIRONMENT: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    PORT: process.env.PORT,
    LOOPS_ENDPOINT: process.env.LOOPS_ENDPOINT,
    LOOPS_API_KEY: process.env.LOOPS_API_KEY,
    NOVU_SECRET_KEY: process.env.NOVU_SECRET_KEY,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
    TRIGGER_PROJECT_ID: process.env.TRIGGER_PROJECT_ID,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER:
      process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
    PLAIN_API_KEY: process.env.PLAIN_API_KEY,
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID:
      process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID,
    OPENPANEL_SECRET_KEY: process.env.OPENPANEL_SECRET_KEY,
    WEBHOOK_SECRET_KEY: process.env.WEBHOOK_SECRET_KEY,
    DUFFEL_TRAVELESE_PRO_ACCESS_TOKEN:
      process.env.DUFFEL_TRAVELESE_PRO_ACCESS_TOKEN,
    DUFFEL_TRAVELESE_PRO_WEBHOOK_SECRET:
      process.env.DUFFEL_TRAVELESE_PRO_WEBHOOK_SECRET,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
