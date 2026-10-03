import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

/**
 * Server-only Supabase client using the service role key. Never import
 * this from client components - the service role key bypasses row
 * level security and must not reach the browser.
 */
export function getSupabaseClient(): SupabaseClient {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
