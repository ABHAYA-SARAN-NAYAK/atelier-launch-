import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Truck, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user } = useAuth();
  const isDesigner = user?.user_type === "student" || user?.user_type === "pro_designer";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const col = isDesigner ? "designer_id" : "buyer_id";
    const { data } = await supabase
      .from("orders")
      .select(`*, product:products(name, primary_image_url, price),
        buyer:users!orders_buyer_id_fkey(full_name, email),
        designer:users!orders_designer_id_fkey(full_name)`)
      .eq(col, user!.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: "shipped" | "delivered") => {
    setUpdatingId(orderId);
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setUpdatingId(null);
  };

  return (
    <div>
      <h1 className="font-display text-3xl">{isDesigner ? "Order Management" : "My Orders"}</h1>
      <p className="mt-1 text-muted-foreground">
        {isDesigner ? "Manage incoming orders and update shipment status." : "Track all your purchases."}
      </p>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border py-16 text-center">
          <p className="font-display text-xl text-muted-foreground">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isDesigner ? "Orders will appear here when buyers purchase your products." : "Start shopping to see your orders here!"}
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order</th>
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
                    {isDesigner ? "Buyer" : "Designer"}
                  </th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">
                    {isDesigner ? "Payout" : "Total"}
                  </th>
                  {isDesigner && <th className="px-4 py-3 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {o.product?.primary_image_url && (
                          <img src={o.product.primary_image_url} alt="" className="h-8 w-8 rounded object-cover" />
                        )}
                        <span className="font-medium">{o.product?.name || "–"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {isDesigner ? o.buyer?.full_name : o.designer?.full_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {isDesigner ? (
                        <span className="text-green-600">${o.designer_payout?.toFixed(2)}</span>
                      ) : (
                        <span>${o.total_amount?.toFixed(2)}</span>
                      )}
                    </td>
                    {isDesigner && (
                      <td className="px-4 py-3 text-right">
                        {o.status === "paid" && (
                          <button
                            onClick={() => updateStatus(o.id, "shipped")}
                            disabled={updatingId === o.id}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-500/20 transition-colors">
                            {updatingId === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
                            Ship
                          </button>
                        )}
                        {o.status === "shipped" && (
                          <button
                            onClick={() => updateStatus(o.id, "delivered")}
                            disabled={updatingId === o.id}
                            className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/20 transition-colors">
                            {updatingId === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Delivered
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600",
    paid: "bg-blue-500/10 text-blue-600",
    shipped: "bg-purple-500/10 text-purple-600",
    delivered: "bg-green-500/10 text-green-600",
    refunded: "bg-red-500/10 text-red-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
