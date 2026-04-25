import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getUser } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const supabase = createServiceClient();

    // Verify the user is a designer
    const { data: userData } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!userData || userData.user_type === "buyer") {
      return errorResponse("Only designers can access analytics", 403);
    }

    // Call the analytics function
    const { data, error } = await supabase.rpc("get_designer_analytics", {
      designer_uuid: user.id,
    });

    if (error) return errorResponse(error.message, 500);

    // Get additional data: recent orders, top products
    const [{ data: recentOrders }, { data: topProducts }] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          id, quantity, total_amount, designer_payout, status, created_at,
          product:products(id, name, primary_image_url),
          buyer:users!orders_buyer_id_fkey(full_name)
        `)
        .eq("designer_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("orders")
        .select("product_id, products(name, primary_image_url, price)")
        .eq("designer_id", user.id)
        .in("status", ["paid", "shipped", "delivered"]),
    ]);

    // Aggregate top products
    const productCounts: Record<string, { name: string; image: string; price: number; count: number; revenue: number }> = {};
    for (const order of topProducts || []) {
      const pid = order.product_id;
      if (!productCounts[pid]) {
        productCounts[pid] = {
          name: (order.products as any)?.name || "Unknown",
          image: (order.products as any)?.primary_image_url || "",
          price: Number((order.products as any)?.price) || 0,
          count: 0,
          revenue: 0,
        };
      }
      productCounts[pid].count++;
      productCounts[pid].revenue += productCounts[pid].price;
    }

    const topProductsList = Object.entries(productCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({ product_id: id, ...data }));

    return jsonResponse({
      analytics: data,
      recent_orders: recentOrders || [],
      top_products: topProductsList,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return errorResponse("Internal server error", 500);
  }
});
