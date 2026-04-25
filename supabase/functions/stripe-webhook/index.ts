import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { verifyWebhookSignature } from "../_shared/stripe.ts";
import {
  sendEmail,
  orderConfirmedBuyerEmail,
  newSaleDesignerEmail,
} from "../_shared/email.ts";

Deno.serve(async (req: Request) => {
  // Stripe webhooks are POST only, no CORS needed
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return errorResponse("Missing stripe-signature header", 400);
    }

    // ── Verify webhook signature ──
    let event;
    try {
      event = await verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return errorResponse("Invalid signature", 400);
    }

    // ── Handle checkout.session.completed ──
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      if (!metadata?.order_data || !metadata?.user_id) {
        console.error("Missing metadata in Stripe session");
        return jsonResponse({ received: true });
      }

      const supabase = createServiceClient();
      const orderData = JSON.parse(metadata.order_data);
      const cartItemIds = JSON.parse(metadata.cart_item_ids || "[]");

      // ── Create orders for each cart item ──
      for (const order of orderData) {
        const { data: newOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            buyer_id: order.buyer_id,
            product_id: order.product_id,
            designer_id: order.designer_id,
            quantity: order.quantity,
            total_amount: order.total_amount,
            platform_commission: order.platform_commission,
            designer_payout: order.designer_payout,
            stripe_payment_id: session.payment_intent,
            shipping_address: order.shipping_address,
            status: "paid",
          })
          .select()
          .single();

        if (orderError) {
          console.error("Failed to create order:", orderError);
          continue;
        }

        // Format shipping address for emails
        const addr = order.shipping_address;
        const addressStr = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`;

        // ── Send buyer confirmation email ──
        const { data: buyer } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("id", order.buyer_id)
          .single();

        if (buyer) {
          const buyerEmail = orderConfirmedBuyerEmail(
            buyer.full_name,
            newOrder.id,
            order.product_name,
            order.total_amount.toFixed(2),
            order.designer_name,
            addressStr
          );
          buyerEmail.to = buyer.email;
          await sendEmail(buyerEmail);
        }

        // ── Send designer sale notification email ──
        if (order.designer_email) {
          const designerEmail = newSaleDesignerEmail(
            order.designer_name,
            order.product_name,
            newOrder.id,
            order.total_amount.toFixed(2),
            order.designer_payout.toFixed(2),
            addressStr
          );
          designerEmail.to = order.designer_email;
          await sendEmail(designerEmail);
        }
      }

      // ── Clear purchased cart items ──
      if (cartItemIds.length) {
        await supabase
          .from("cart_items")
          .delete()
          .in("id", cartItemIds)
          .eq("user_id", metadata.user_id);
      }

      console.log(`✅ Processed ${orderData.length} orders from session ${session.id}`);
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return errorResponse("Webhook processing failed", 500);
  }
});
