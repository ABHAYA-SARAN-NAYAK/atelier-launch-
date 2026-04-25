import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ── Helper: Get current user ──
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ── Helper: Get current session ──
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session;
}

// ── Helper: Edge Function caller ──
export async function callEdgeFunction<T = unknown>(
  functionName: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
    params?: Record<string, string>;
  }
): Promise<{ data: T | null; error: string | null }> {
  const session = await getSession();

  const url = new URL(
    `${supabaseUrl}/functions/v1/${functionName}`
  );

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );
  }

  try {
    const response = await fetch(url.toString(), {
      method: options?.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: session ? `Bearer ${session.access_token}` : "",
        apikey: supabaseAnonKey,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data.error || "Request failed" };
    }

    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
