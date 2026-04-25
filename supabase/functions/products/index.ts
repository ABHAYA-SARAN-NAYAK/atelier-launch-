import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createUserClient, getUser } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const productId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  switch (req.method) {
    case "POST":
      return createProduct(req);
    case "PUT":
      return updateProduct(req, productId);
    default:
      return errorResponse("Method not allowed", 405);
  }
});

// ── POST /products ──
async function createProduct(req: Request) {
  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const supabase = createUserClient(req);
  const body = await req.json();

  const {
    collection_id,
    name,
    description,
    price,
    quantity_available,
    sizes_available,
    primary_image_url,
    gallery_images,
    materials_used,
    care_instructions,
  } = body;

  // Validation
  if (!collection_id || !name || !price || !primary_image_url) {
    return errorResponse(
      "Missing required fields: collection_id, name, price, primary_image_url"
    );
  }

  if (price <= 0) return errorResponse("Price must be greater than 0");

  // Verify collection ownership (RLS handles this, but let's be explicit)
  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("id, designer_id")
    .eq("id", collection_id)
    .eq("designer_id", user.id)
    .single();

  if (colError || !collection) {
    return errorResponse("Collection not found or you don't own it", 403);
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      collection_id,
      name,
      description,
      price,
      quantity_available: quantity_available || 0,
      sizes_available: sizes_available || [],
      primary_image_url,
      gallery_images: gallery_images || [],
      materials_used,
      care_instructions,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse(data, 201);
}

// ── PUT /products/:id ──
async function updateProduct(req: Request, id: string | null) {
  if (!id) return errorResponse("Product ID required", 400);

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const supabase = createUserClient(req);
  const body = await req.json();

  // Remove fields that shouldn't be updated directly
  delete body.id;
  delete body.collection_id;
  delete body.created_at;
  delete body.status; // Managed by trigger

  const { data, error } = await supabase
    .from("products")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Product not found or unauthorized", 404);
  return jsonResponse(data);
}
