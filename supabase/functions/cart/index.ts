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
  const itemId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  switch (req.method) {
    case "GET":
      return getCart(req, user.id);
    case "POST":
      return addToCart(req, user.id);
    case "PUT":
      return updateCartItem(req, user.id, itemId);
    case "DELETE":
      return removeFromCart(req, user.id, itemId);
    default:
      return errorResponse("Method not allowed", 405);
  }
});

// ── GET /cart ──
async function getCart(req: Request, userId: string) {
  const supabase = createUserClient(req);

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:products(
        *,
        collection:collections(
          id, title, status, drop_end_date,
          designer:users!collections_designer_id_fkey(id, full_name, profile_image_url)
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return errorResponse(error.message, 500);

  // Check availability for each item
  const items = (data || []).map((item) => ({
    ...item,
    is_available:
      item.product?.status === "available" &&
      item.product?.collection?.status === "live" &&
      item.quantity <= (item.product?.quantity_available || 0),
  }));

  return jsonResponse({ cart_items: items });
}

// ── POST /cart ──
async function addToCart(req: Request, userId: string) {
  const supabase = createUserClient(req);
  const { product_id, quantity, selected_size } = await req.json();

  if (!product_id || !quantity || !selected_size) {
    return errorResponse("Missing required fields: product_id, quantity, selected_size");
  }

  if (quantity <= 0) return errorResponse("Quantity must be positive");

  // Validate product availability
  const { data: product, error: prodError } = await supabase
    .from("products")
    .select("id, quantity_available, sizes_available, status")
    .eq("id", product_id)
    .single();

  if (prodError || !product) return errorResponse("Product not found", 404);
  if (product.status === "sold_out") return errorResponse("Product is sold out");
  if (quantity > product.quantity_available) {
    return errorResponse(`Only ${product.quantity_available} items available`);
  }

  // Validate size
  const sizes = product.sizes_available as string[];
  if (!sizes.includes(selected_size)) {
    return errorResponse(`Size "${selected_size}" not available. Available: ${sizes.join(", ")}`);
  }

  // Upsert cart item
  const { data, error } = await supabase
    .from("cart_items")
    .upsert(
      { user_id: userId, product_id, quantity, selected_size },
      { onConflict: "user_id,product_id,selected_size" }
    )
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return jsonResponse(data, 201);
}

// ── PUT /cart/:item_id ──
async function updateCartItem(req: Request, userId: string, itemId: string | null) {
  if (!itemId) return errorResponse("Cart item ID required", 400);

  const supabase = createUserClient(req);
  const { quantity } = await req.json();

  if (!quantity || quantity <= 0) return errorResponse("Valid quantity required");

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Cart item not found", 404);
  return jsonResponse(data);
}

// ── DELETE /cart/:item_id ──
async function removeFromCart(req: Request, userId: string, itemId: string | null) {
  if (!itemId) return errorResponse("Cart item ID required", 400);

  const supabase = createUserClient(req);

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ message: "Item removed from cart" });
}
