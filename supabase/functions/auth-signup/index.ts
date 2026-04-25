import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { sendEmail, welcomeDesignerEmail } from "../_shared/email.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const {
      email,
      password,
      full_name,
      user_type,
      school_name,
      graduation_year,
      specialization,
    } = await req.json();

    // ── Validate required fields ──
    if (!email || !password || !full_name || !user_type) {
      return errorResponse("Missing required fields: email, password, full_name, user_type");
    }

    if (!["buyer", "student", "pro_designer"].includes(user_type)) {
      return errorResponse("Invalid user_type. Must be: buyer, student, or pro_designer");
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      return errorResponse("Password must contain at least 1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      return errorResponse("Password must contain at least 1 lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      return errorResponse("Password must contain at least 1 number");
    }

    // Designer-specific validation
    if (user_type !== "buyer") {
      if (!school_name || !graduation_year) {
        return errorResponse("Designers must provide school_name and graduation_year");
      }
    }

    const supabase = createServiceClient();

    // ── Create Auth user ──
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, user_type },
    });

    if (authError) {
      return errorResponse(authError.message, 400);
    }

    const userId = authData.user.id;

    // ── Insert into users table ──
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email,
      password_hash: "managed_by_supabase_auth",
      user_type,
      full_name,
    });

    if (userError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(userId);
      return errorResponse(`Failed to create user profile: ${userError.message}`, 500);
    }

    // ── Insert designer profile if applicable ──
    if (user_type !== "buyer") {
      const { error: profileError } = await supabase.from("designer_profiles").insert({
        user_id: userId,
        school_name,
        graduation_year,
        specialization: specialization || null,
      });

      if (profileError) {
        // Rollback
        await supabase.from("users").delete().eq("id", userId);
        await supabase.auth.admin.deleteUser(userId);
        return errorResponse(`Failed to create designer profile: ${profileError.message}`, 500);
      }

      // Send welcome email
      const emailData = welcomeDesignerEmail(full_name);
      emailData.to = email;
      await sendEmail(emailData);
    }

    // ── Sign in to get session token ──
    const { data: session, error: signInError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    // Return user data
    return jsonResponse({
      user: {
        id: userId,
        email,
        full_name,
        user_type,
      },
      message: "Account created successfully",
    }, 201);
  } catch (err) {
    console.error("Signup error:", err);
    return errorResponse("Internal server error", 500);
  }
});
