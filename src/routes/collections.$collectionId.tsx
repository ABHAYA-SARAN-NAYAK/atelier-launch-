import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Countdown } from "@/components/site/Countdown";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/collections/$collectionId")({ component: CollectionDetail });

function CollectionDetail() {
  const { collectionId } = Route.useParams();
  const { user } = useAuth();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [collectionId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: col } = await supabase
      .from("collections")
      .select(`*, designer:users!collections_designer_id_fkey(id, full_name, profile_image_url)`)
      .eq("id", collectionId)
      .single();
    setCollection(col);

    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .eq("collection_id", collectionId)
      .order("created_at");
    setProducts(prods || []);
    setLoading(false);
  };

  const addToCart = async (product: any) => {
    if (!user) { window.location.href = "/auth"; return; }
    const size = selectedSizes[product.id] || product.sizes_available?.[0] || "M";
    setAddingToCart(product.id);
    await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: 1,
      selected_size: size,
    });
    setAddingToCart(null);
    alert("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-48 rounded-xl bg-muted" />
              <div className="h-48 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-24 text-center">
          <h1 className="font-display text-3xl">Collection not found</h1>
          <Link to="/collections" className="mt-4 inline-flex items-center gap-2 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const endMs = new Date(collection.drop_end_date).getTime();
  const isLive = collection.status === "live" && endMs > Date.now();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <Link to="/collections" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> All Collections
        </Link>

        {/* Collection Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isLive && (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">● Live Drop</span>
              )}
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <Countdown endsAt={endMs} />
              </span>
            </div>
            <h1 className="font-display text-4xl font-light sm:text-5xl">{collection.title}</h1>
            {collection.description && (
              <p className="mt-3 max-w-xl text-muted-foreground">{collection.description}</p>
            )}
          </div>

          {/* Designer sidebar */}
          {collection.designer && (
            <Link to={`/designers/${collection.designer.id}`}
              className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                {collection.designer.profile_image_url && (
                  <img src={collection.designer.profile_image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <p className="font-medium">{collection.designer.full_name}</p>
                <p className="text-xs text-muted-foreground">View designer profile →</p>
              </div>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-xl text-muted-foreground">No products in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                  {p.primary_image_url ? (
                    <img src={p.primary_image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                  )}
                  {p.status === "sold_out" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                      <span className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Sold Out</span>
                    </div>
                  )}
                  <button className="absolute right-3 top-3 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg">{p.name}</h3>
                    <p className="text-lg font-medium text-gold">${p.price}</p>
                  </div>
                  {p.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}

                  {/* Size selector */}
                  {p.sizes_available?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.sizes_available.map((size: string) => (
                        <button key={size}
                          onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: size }))}
                          className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                            (selectedSizes[p.id] || p.sizes_available[0]) === size
                              ? "border-gold bg-gold/10 text-foreground"
                              : "border-input text-muted-foreground hover:border-gold/50"
                          }`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add to cart */}
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.status === "sold_out" || addingToCart === p.id}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
                    {addingToCart === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><ShoppingBag className="h-4 w-4" /> {p.status === "sold_out" ? "Sold Out" : "Add to Cart"}</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
