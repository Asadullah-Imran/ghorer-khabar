import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client with Service Role Key
 * Bypasses Row Level Security - use only in secure server-side code
 * DO NOT expose this client to the browser/client-side
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error(
      "Missing Supabase URL or Service Role Key. Please check your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
