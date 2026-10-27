import { createClient } from '@supabase/supabase-js';

// Supabase client for the Smart College Bus Management System.
// Credentials come from the project .env (pre-populated). The anon key is
// safe to expose in frontend code — it only grants access permitted by RLS.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fail loudly in dev so a missing env is obvious; never hardcode keys.
  console.error('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(
  url ?? '',
  anonKey ?? '',
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

export const isSupabaseConfigured = Boolean(url && anonKey);
