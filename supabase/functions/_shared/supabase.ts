import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Create a Supabase client using the service role key (for Edge Functions).
 * This bypasses RLS — use with caution for admin operations.
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Create a Supabase client using the user's JWT token (respects RLS).
 * Pass the Authorization header from the incoming request.
 */
export function createUserClient(req: Request) {
  const authHeader = req.headers.get("Authorization");

  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: { Authorization: authHeader ?? "" },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Extract the authenticated user from a request.
 * Returns null if not authenticated.
 */
export async function getUser(req: Request) {
  const client = createUserClient(req);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return null;
  return user;
}
