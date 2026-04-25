import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    const supabase = createServiceClient();

    // ── Authenticate ──
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return errorResponse("Invalid email or password", 401);
    }

    // ── Fetch user profile ──
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*, designer_profiles(*)")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      return errorResponse("Failed to fetch user profile", 500);
    }

    return jsonResponse({
      user: profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse("Internal server error", 500);
  }
});
