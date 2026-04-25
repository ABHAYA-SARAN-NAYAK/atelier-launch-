import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Minus, Plus, ShoppingBag, Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/cart")({ component: CartPage });

function CartPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select(`*, product:products(*, collection:collections(title, designer:users!collections_designer_id_fkey(full_name)))`)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", itemId);
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)));
  };

  const removeItem = async (itemId: string) => {
    setRemovingId(itemId);
    await supabase.from("cart_items").delete().eq("id", itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setRemovingId(null);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <div>
      <h1 className="font-display text-3xl">Shopping Cart</h1>
      <p className="mt-1 text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border py-16 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 font-display text-xl text-muted-foreground">Your cart is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Discover unique pieces from emerging designers.</p>
          <Link to="/collections"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Browse Collections <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/30">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.product?.primary_image_url ? (
                    <img src={item.product.primary_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium truncate">{item.product?.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.product?.collection?.title} · {item.product?.collection?.designer?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Size: {item.selected_size}</p>
                    </div>
                    <p className="font-medium text-gold whitespace-nowrap">${(item.product?.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="rounded-md border border-input p-1 hover:bg-muted disabled:opacity-30 transition-colors">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="rounded-md border border-input p-1 hover:bg-muted transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} disabled={removingId === item.id}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                      {removingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="h-fit rounded-xl border border-border p-6">
            <h3 className="font-display text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-sm text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium">Estimated Total</span>
                <span className="font-display text-xl text-gold">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Proceed to Checkout
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Secure checkout powered by Stripe. Payment integration coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
