import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * This key bypasses Row Level Security, so it must NEVER be imported into a
 * client component or exposed to the browser. It is only used inside API routes
 * and server components. Public reads still go through the /api/posts route,
 * which explicitly filters to published posts.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // Fail loudly at import time in server context if misconfigured.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local.",
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
