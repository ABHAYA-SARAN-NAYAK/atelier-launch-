import { createFileRoute, Link, Outlet, useNavigate, useMatchRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, ShoppingBag, Package, ShoppingCart, FolderOpen, PlusCircle, User, LogOut, Loader2 } from "lucide-react";
import logo from "@/assets/logo-atelier.jpg";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }

  const isDesigner = user.user_type === "student" || user.user_type === "pro_designer";

  const buyerNav = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: ShoppingBag, label: "My Orders", to: "/dashboard/orders" },
    { icon: ShoppingCart, label: "Cart", to: "/dashboard/cart" },
    { icon: User, label: "Profile", to: "/dashboard/profile" },
  ];

  const designerNav = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: FolderOpen, label: "My Collections", to: "/dashboard/my-collections" },
    { icon: PlusCircle, label: "New Collection", to: "/dashboard/my-collections/new" },
    { icon: Package, label: "Orders", to: "/dashboard/orders" },
    { icon: User, label: "Profile", to: "/dashboard/profile" },
  ];

  const navItems = isDesigner ? designerNav : buyerNav;

  const isActive = (to: string) => {
    if (to === "/dashboard") return !!matchRoute({ to: "/dashboard", fuzzy: false });
    return !!matchRoute({ to, fuzzy: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <Link to="/">
            <img src={logo} alt="Atelier Launch" className="h-8 w-8 rounded-md object-cover" />
          </Link>
          <Link to="/" className="font-display text-sm tracking-tight">Atelier Launch</Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? "bg-gold/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {user.profile_image_url ? (
                <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium">{user.full_name?.[0]}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 rounded-md object-cover" />
            <span className="font-display text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}
                className={`rounded-lg p-2 transition-colors ${
                  isActive(item.to) ? "bg-gold/10 text-foreground" : "text-muted-foreground"
                }`}>
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
