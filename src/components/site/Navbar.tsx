import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-atelier.jpg";

const nav = [
  { label: "Collections", href: "/collections" },
  { label: "Designers", href: "/designers" },
  { label: "How it Works", href: "/#how" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch cart count
  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("cart_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => setCartCount(count || 0));
    });
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Atelier Launch" className="h-9 w-9 rounded-md object-cover" />
          <span className="font-display text-lg tracking-tight">Atelier Launch</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <Link to="/dashboard/cart"
              aria-label="Cart"
              className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-medium text-coral-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 transition-colors hover:bg-muted"
              >
                <div className="h-7 w-7 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium">{user.full_name?.[0]}</span>
                  )}
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">{user.full_name?.split(" ")[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card py-2 shadow-soft">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <button onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                Join Atelier
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm text-foreground"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-3 text-sm text-foreground">
                  Dashboard
                </Link>
                <Link to="/dashboard/cart" onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-3 text-sm text-foreground">
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <button onClick={() => { signOut(); setOpen(false); }}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-input px-5 py-2.5 text-sm font-medium text-foreground">
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Join Atelier
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
