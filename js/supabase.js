import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This key is intentionally public and protected by Supabase RLS policies.
// Never place the service_role key in this file or in any browser bundle.
export const SUPABASE_URL = "https://okztuqmwssuiopkuxzrr.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_-FQpEm2oa4TvIElYwVpd8w_E8GlYUjp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
