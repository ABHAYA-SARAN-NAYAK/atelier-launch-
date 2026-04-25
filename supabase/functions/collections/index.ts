import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createUserClient, createServiceClient, getUser } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const collectionId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  switch (req.method) {
    case "GET":
      return collectionId ? getCollectionById(collectionId) : getCollections(url);
    case "POST":
      return createCollection(req);
    case "PUT":
      return updateCollection(req, collectionId);
    case "DELETE":
      return deleteCollection(req, collectionId);
    default:
      return errorResponse("Method not allowed", 405);
  }
});

// ── GET /collections?status=live&designer_id=...&sort=recent ──
async function getCollections(url: URL) {
  const supabase = createServiceClient();

  const status = url.searchParams.get("status");
  const designerId = url.searchParams.get("designer_id");
  const schoolName = url.searchParams.get("school_name");
  const specialization = url.searchParams.get("specialization");
  const sort = url.searchParams.get("sort") || "recent";
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = supabase
    .from("collections")
    .select(`
      *,
      designer:users!collections_designer_id_fkey(id, full_name, profile_image_url, user_type),
      products(count)
    `, { count: "exact" })
    .range(offset, offset + limit - 1);

  // Filters
  if (status) query = query.eq("status", status);
  if (designerId) query = query.eq("designer_id", designerId);

  // Sort
  switch (sort) {
    case "ending_soon":
      query = query.eq("status", "live").order("drop_end_date", { ascending: true });
      break;
    case "price":
      query = query.order("created_at", { ascending: false });
      break;
    default: // recent
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ collections: data, total: count });
}

// ── GET /collections/:id ──
async function getCollectionById(id: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("collections")
    .select(`
      *,
      designer:users!collections_designer_id_fkey(
        id, full_name, profile_image_url, user_type,
        designer_profiles(*)
      ),
      products(*)
    `)
    .eq("id", id)
    .single();

  if (error) return errorResponse("Collection not found", 404);

  // Get follower count
  const { count: followerCount } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("designer_id", data.designer_id);

  return jsonResponse({ ...data, follower_count: followerCount || 0 });
}

// ── POST /collections ──
async function createCollection(req: Request) {
  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const supabase = createUserClient(req);

  // Verify designer
  const { data: profile } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type === "buyer") {
    return errorResponse("Only designers can create collections", 403);
  }

  const { title, description, drop_start_date, drop_end_date } = await req.json();

  if (!title || !drop_start_date || !drop_end_date) {
    return errorResponse("Missing required fields: title, drop_start_date, drop_end_date");
  }

  // Validate 72-hour window
  const start = new Date(drop_start_date);
  const end = new Date(drop_end_date);
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1 || diffHours > 72) {
    return errorResponse("Drop window must be between 1 and 72 hours");
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({
      designer_id: user.id,
      title,
      description,
      drop_start_date,
      drop_end_date,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse(data, 201);
}

// ── PUT /collections/:id ──
async function updateCollection(req: Request, id: string | null) {
  if (!id) return errorResponse("Collection ID required", 400);

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const supabase = createUserClient(req);
  const body = await req.json();

  const { data, error } = await supabase
    .from("collections")
    .update(body)
    .eq("id", id)
    .eq("designer_id", user.id)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Collection not found or unauthorized", 404);
  return jsonResponse(data);
}

// ── DELETE /collections/:id ──
async function deleteCollection(req: Request, id: string | null) {
  if (!id) return errorResponse("Collection ID required", 400);

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const supabase = createUserClient(req);

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("designer_id", user.id);

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ message: "Collection deleted successfully" });
}
