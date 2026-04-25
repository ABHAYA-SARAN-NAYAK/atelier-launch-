import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, ShoppingBag, Package, Users, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const { user } = useAuth();
  const isDesigner = user?.user_type === "student" || user?.user_type === "pro_designer";

  return isDesigner ? <DesignerDashboard /> : <BuyerDashboard />;
}

function BuyerDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [followedDesigners, setFollowedDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: orders } = await supabase
      .from("orders")
      .select(`*, product:products(name, primary_image_url)`)
      .eq("buyer_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentOrders(orders || []);

    const { data: follows } = await supabase
      .from("follows")
      .select(`*, designer:users!follows_designer_id_fkey(id, full_name, profile_image_url)`)
      .eq("follower_id", user!.id)
      .limit(6);
    setFollowedDesigners(follows || []);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Welcome back, {user?.full_name?.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-muted-foreground">Here's what's new on Atelier Launch.</p>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/collections" className="rounded-xl border border-border p-5 transition-all hover:border-gold/50 hover:shadow-soft">
          <ShoppingBag className="h-5 w-5 text-gold" />
          <h3 className="mt-3 font-medium">Browse Collections</h3>
          <p className="mt-1 text-sm text-muted-foreground">Discover new limited drops</p>
        </Link>
        <Link to="/dashboard/orders" className="rounded-xl border border-border p-5 transition-all hover:border-gold/50 hover:shadow-soft">
          <Package className="h-5 w-5 text-gold" />
          <h3 className="mt-3 font-medium">Track Orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">{recentOrders.length} recent orders</p>
        </Link>
        <Link to="/designers" className="rounded-xl border border-border p-5 transition-all hover:border-gold/50 hover:shadow-soft">
          <Users className="h-5 w-5 text-gold" />
          <h3 className="mt-3 font-medium">Explore Designers</h3>
          <p className="mt-1 text-sm text-muted-foreground">Following {followedDesigners.length} designers</p>
        </Link>
      </div>

      {/* Followed designers */}
      {followedDesigners.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl mb-4">Designers You Follow</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {followedDesigners.map((f) => (
              <Link key={f.id} to={`/designers/${f.designer?.id}`} className="flex flex-col items-center text-center group">
                <div className="h-16 w-16 rounded-full bg-muted overflow-hidden ring-2 ring-transparent group-hover:ring-gold/50 transition-all">
                  {f.designer?.profile_image_url ? (
                    <img src={f.designer.profile_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg">{f.designer?.full_name?.[0]}</div>
                  )}
                </div>
                <p className="mt-2 text-xs font-medium truncate max-w-full">{f.designer?.full_name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-gold hover:underline inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{o.product?.name || "–"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${o.total_amount}</td>
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

function DesignerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, followers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // Orders + revenue
    const { data: orders } = await supabase
      .from("orders")
      .select(`*, product:products(name), buyer:users!orders_buyer_id_fkey(full_name)`)
      .eq("designer_id", user!.id)
      .order("created_at", { ascending: false });
    const allOrders = orders || [];
    setRecentOrders(allOrders.slice(0, 5));

    const revenue = allOrders.reduce((sum, o) => sum + (o.designer_payout || 0), 0);
    const productsSold = allOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);

    // Followers
    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("designer_id", user!.id);

    setStats({ revenue, orders: allOrders.length, products: productsSold, followers: followers || 0 });
    setLoading(false);
  };

  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: TrendingUp, color: "text-green-500" },
    { label: "Total Orders", value: stats.orders.toString(), icon: Package, color: "text-blue-500" },
    { label: "Products Sold", value: stats.products.toString(), icon: ShoppingBag, color: "text-gold" },
    { label: "Followers", value: stats.followers.toString(), icon: Users, color: "text-coral" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Designer Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome back, {user?.full_name}. Here's your overview.</p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-5">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <p className="mt-3 font-display text-2xl">{loading ? "–" : s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/dashboard/my-collections/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          + Create New Collection
        </Link>
        <Link to="/dashboard/my-collections"
          className="inline-flex items-center gap-2 rounded-full border border-input px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          Manage Collections
        </Link>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl mb-4">Recent Orders</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Buyer</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Product</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{o.buyer?.full_name || "–"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{o.product?.name || "–"}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">${o.designer_payout?.toFixed(2)}</td>
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
    cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
