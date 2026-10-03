const REQUIRED_ENV_VARS = [
  "ASAAS_API_KEY",
  "ASAAS_API_BASE_URL",
  "ASAAS_WEBHOOK_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "MENTOR_EMAIL",
  "ADMIN_PASSWORD",
  "CRON_SECRET",
] as const;

export type Env = Record<(typeof REQUIRED_ENV_VARS)[number], string>;

/**
 * Reads and validates all environment variables required by the app.
 * Throws a descriptive error naming every missing variable instead of
 * failing later with an undefined value deep in some unrelated call.
 */
export function getEnv(): Env {
  const missing: string[] = [];
  const env = {} as Env;

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      env[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
  }

  return env;
}
