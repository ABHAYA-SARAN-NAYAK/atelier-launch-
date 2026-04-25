import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createUserClient, createServiceClient, getUser } from "../_shared/supabase.ts";
import { sendEmail, orderShippedEmail, orderDeliveredEmail } from "../_shared/email.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  switch (req.method) {
    case "GET":
      return getOrders(req, user.id);
    case "PUT": {
      // PUT /orders/:id/status
      const orderId = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : null;
      return updateOrderStatus(req, user.id, orderId);
    }
    default:
      return errorResponse("Method not allowed", 405);
  }
});

// ── GET /orders ──
async function getOrders(req: Request, userId: string) {
  const supabase = createUserClient(req);
  const serviceClient = createServiceClient();

  // Determine user type
  const { data: userData } = await serviceClient
    .from("users")
    .select("user_type")
    .eq("id", userId)
    .single();

  let query;
  if (userData?.user_type === "buyer") {
    // Buyer sees their purchases
    query = supabase
      .from("orders")
      .select(`
        *,
        product:products(id, name, primary_image_url, price),
        designer:users!orders_designer_id_fkey(id, full_name, profile_image_url)
      `)
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });
  } else {
    // Designer sees orders for their products
    query = supabase
      .from("orders")
      .select(`
        *,
        product:products(id, name, primary_image_url, price),
        buyer:users!orders_buyer_id_fkey(id, full_name, email)
      `)
      .eq("designer_id", userId)
      .order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ orders: data || [] });
}

// ── PUT /orders/:id/status ──
async function updateOrderStatus(
  req: Request,
  userId: string,
  orderId: string | null
) {
  if (!orderId) return errorResponse("Order ID required", 400);

  const { status } = await req.json();
  if (!status || !["shipped", "delivered"].includes(status)) {
    return errorResponse("Status must be 'shipped' or 'delivered'");
  }

  const supabase = createUserClient(req);
  const serviceClient = createServiceClient();

  // Update order (RLS ensures only designer can update)
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("designer_id", userId)
    .select(`
      *,
      product:products(id, name),
      buyer:users!orders_buyer_id_fkey(id, full_name, email)
    `)
    .single();

  if (error) return errorResponse(error.message, 500);
  if (!order) return errorResponse("Order not found or unauthorized", 404);

  // ── Send notification email to buyer ──
  if (order.buyer && order.product) {
    let emailData;
    if (status === "shipped") {
      emailData = orderShippedEmail(
        order.buyer.full_name,
        order.id,
        order.product.name
      );
    } else if (status === "delivered") {
      emailData = orderDeliveredEmail(
        order.buyer.full_name,
        order.id,
        order.product.name,
        order.designer_id
      );
    }

    if (emailData) {
      emailData.to = order.buyer.email;
      await sendEmail(emailData);
    }
  }

  return jsonResponse(order);
}
