import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the SERVICE ROLE key, so it must never be imported
// into a client component. It bypasses RLS to insert leads from the API route.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // Fails fast at runtime if env is misconfigured (e.g. on Vercel).
  console.warn("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(url ?? "", serviceKey ?? "", {
  auth: { persistSession: false },
});
