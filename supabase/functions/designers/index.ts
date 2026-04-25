import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const designerId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  return designerId ? getDesignerById(designerId) : getDesigners(url);
});

// ── GET /designers?school_name=Parsons&specialization=womenswear ──
async function getDesigners(url: URL) {
  const supabase = createServiceClient();

  const schoolName = url.searchParams.get("school_name");
  const specialization = url.searchParams.get("specialization");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = supabase
    .from("designer_profiles")
    .select(`
      *,
      user:users!designer_profiles_user_id_fkey(id, full_name, profile_image_url, user_type, created_at)
    `)
    .eq("verification_status", "verified")
    .range(offset, offset + limit - 1);

  if (schoolName) query = query.ilike("school_name", `%${schoolName}%`);
  if (specialization) query = query.eq("specialization", specialization);

  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);

  // Enrich with follower count and active collections count
  const enriched = await Promise.all(
    (data || []).map(async (profile) => {
      const [{ count: followerCount }, { count: activeCollections }] = await Promise.all([
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("designer_id", profile.user_id),
        supabase
          .from("collections")
          .select("id", { count: "exact", head: true })
          .eq("designer_id", profile.user_id)
          .eq("status", "live"),
      ]);

      return {
        ...profile,
        follower_count: followerCount || 0,
        active_collections: activeCollections || 0,
      };
    })
  );

  return jsonResponse({ designers: enriched });
}

// ── GET /designers/:id ──
async function getDesignerById(id: string) {
  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("designer_profiles")
    .select(`
      *,
      user:users!designer_profiles_user_id_fkey(id, full_name, profile_image_url, user_type, created_at)
    `)
    .eq("user_id", id)
    .single();

  if (error || !profile) return errorResponse("Designer not found", 404);

  // Get collections, follower count
  const [{ data: collections }, { count: followerCount }] = await Promise.all([
    supabase
      .from("collections")
      .select("*, products(count)")
      .eq("designer_id", id)
      .in("status", ["live", "ended"])
      .order("created_at", { ascending: false }),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("designer_id", id),
  ]);

  return jsonResponse({
    ...profile,
    collections: collections || [],
    follower_count: followerCount || 0,
  });
}
