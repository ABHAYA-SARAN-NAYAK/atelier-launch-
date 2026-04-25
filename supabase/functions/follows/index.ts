import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createUserClient, getUser } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const designerId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  switch (req.method) {
    case "POST":
      return followDesigner(req, user.id);
    case "DELETE":
      return unfollowDesigner(req, user.id, designerId);
    default:
      return errorResponse("Method not allowed", 405);
  }
});

// ── POST /follows ──
async function followDesigner(req: Request, userId: string) {
  const { designer_id } = await req.json();

  if (!designer_id) return errorResponse("designer_id is required");
  if (designer_id === userId) return errorResponse("You cannot follow yourself");

  const supabase = createUserClient(req);

  const { data, error } = await supabase
    .from("follows")
    .insert({ follower_id: userId, designer_id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return errorResponse("Already following this designer", 409);
    }
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ message: "Now following designer", follow: data }, 201);
}

// ── DELETE /follows/:designer_id ──
async function unfollowDesigner(req: Request, userId: string, designerId: string | null) {
  if (!designerId) return errorResponse("Designer ID required", 400);

  const supabase = createUserClient(req);

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", userId)
    .eq("designer_id", designerId);

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ message: "Unfollowed designer" });
}
