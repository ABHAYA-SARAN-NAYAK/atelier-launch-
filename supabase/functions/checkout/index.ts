import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createUserClient, createServiceClient, getUser } from "../_shared/supabase.ts";
import { getStripe } from "../_shared/stripe.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const { cart_item_ids, shipping_address } = await req.json();

    if (!cart_item_ids?.length) {
      return errorResponse("cart_item_ids is required and must not be empty");
    }
    if (!shipping_address) {
      return errorResponse("shipping_address is required");
    }

    const supabase = createServiceClient();
    const stripe = getStripe();

    // ── Fetch cart items with product & collection details ──
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products(
          *,
          collection:collections(
            id, title, status,
            designer:users!collections_designer_id_fkey(id, full_name, user_type, email)
          )
        )
      `)
      .in("id", cart_item_ids)
      .eq("user_id", user.id);

    if (cartError) return errorResponse(cartError.message, 500);
    if (!cartItems?.length) return errorResponse("No valid cart items found", 404);

    // ── Validate all items ──
    const lineItems = [];
    const orderPrepData = [];

    for (const item of cartItems) {
      const product = item.product;
      if (!product) {
        return errorResponse(`Product not found for cart item ${item.id}`);
      }

      if (product.status === "sold_out") {
        return errorResponse(`"${product.name}" is sold out`);
      }

      if (product.collection?.status !== "live") {
        return errorResponse(`"${product.name}" is no longer available (collection not live)`);
      }

      if (item.quantity > product.quantity_available) {
        return errorResponse(
          `Only ${product.quantity_available} of "${product.name}" available`
        );
      }

      const designer = product.collection?.designer;
      const totalAmount = Number(product.price) * item.quantity;
      const userType = designer?.user_type || "student";
      const commissionRate = userType === "student" ? 0.15 : 0.10;
      const commission = Math.round(totalAmount * commissionRate * 100) / 100;
      const payout = Math.round((totalAmount - commission) * 100) / 100;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: `by ${designer?.full_name || "Unknown"} • Size: ${item.selected_size}`,
            images: [product.primary_image_url],
          },
          unit_amount: Math.round(Number(product.price) * 100), // cents
        },
        quantity: item.quantity,
      });

      orderPrepData.push({
        buyer_id: user.id,
        product_id: product.id,
        designer_id: designer?.id,
        designer_email: designer?.email,
        designer_name: designer?.full_name,
        product_name: product.name,
        quantity: item.quantity,
        total_amount: totalAmount,
        platform_commission: commission,
        designer_payout: payout,
        shipping_address,
      });
    }

    // ── Create Stripe Checkout Session ──
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/orders?success=true`,
      cancel_url: `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/cart?cancelled=true`,
      metadata: {
        user_id: user.id,
        cart_item_ids: JSON.stringify(cart_item_ids),
        order_data: JSON.stringify(orderPrepData),
      },
      customer_email: user.email,
    });

    return jsonResponse({
      session_id: session.id,
      session_url: session.url,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return errorResponse("Checkout failed. Please try again.", 500);
  }
});
