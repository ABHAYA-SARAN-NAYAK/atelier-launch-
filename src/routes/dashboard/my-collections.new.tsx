import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/my-collections/new")({ component: NewCollectionPage });

function NewCollectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dropEnd = new Date(tomorrow.getTime() + 72 * 60 * 60 * 1000);

  const [form, setForm] = useState({
    title: "",
    description: "",
    drop_start_date: tomorrow.toISOString().slice(0, 16),
    drop_end_date: dropEnd.toISOString().slice(0, 16),
  });

  const [products, setProducts] = useState<Array<{
    name: string;
    description: string;
    price: string;
    quantity_available: string;
    sizes_available: string[];
    materials_used: string;
    care_instructions: string;
  }>>([{
    name: "", description: "", price: "", quantity_available: "5",
    sizes_available: ["S", "M", "L"], materials_used: "", care_instructions: "",
  }]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const updateProduct = (index: number, field: string, value: any) => {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, {
      name: "", description: "", price: "", quantity_available: "5",
      sizes_available: ["S", "M", "L"], materials_used: "", care_instructions: "",
    }]);
  };

  const removeProduct = (index: number) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (index: number, size: string) => {
    setProducts((prev) => prev.map((p, i) => {
      if (i !== index) return p;
      const has = p.sizes_available.includes(size);
      return { ...p, sizes_available: has ? p.sizes_available.filter((s) => s !== size) : [...p.sizes_available, size] };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!form.title.trim()) { setError("Collection title is required."); return; }
    const validProducts = products.filter((p) => p.name.trim() && p.price);
    if (validProducts.length === 0) { setError("Add at least one product."); return; }

    setLoading(true);

    // Create collection
    const { data: col, error: colErr } = await supabase
      .from("collections")
      .insert({
        designer_id: user.id,
        title: form.title,
        description: form.description || null,
        drop_start_date: new Date(form.drop_start_date).toISOString(),
        drop_end_date: new Date(form.drop_end_date).toISOString(),
        status: "draft",
      })
      .select()
      .single();

    if (colErr || !col) {
      setError(colErr?.message || "Failed to create collection.");
      setLoading(false);
      return;
    }

    // Create products
    const productRows = validProducts.map((p) => ({
      collection_id: col.id,
      name: p.name,
      description: p.description || null,
      price: parseFloat(p.price),
      quantity_available: parseInt(p.quantity_available) || 5,
      sizes_available: p.sizes_available,
      primary_image_url: null,
      gallery_images: [],
      materials_used: p.materials_used || null,
      care_instructions: p.care_instructions || null,
      status: "available" as const,
    }));

    const { error: prodErr } = await supabase.from("products").insert(productRows);
    if (prodErr) {
      setError(prodErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate({ to: "/dashboard/my-collections" });
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="max-w-3xl">
      <Link to="/dashboard/my-collections" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Collections
      </Link>

      <h1 className="font-display text-3xl">Create New Collection</h1>
      <p className="mt-1 text-muted-foreground">Set up a new drop with products.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {/* Collection Details */}
        <div className="space-y-4 rounded-xl border border-border p-6">
          <h2 className="font-display text-lg">Collection Details</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="e.g. Neon Twilight" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              maxLength={500} rows={3}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
              placeholder="Tell the story behind this collection..." />
            <p className="mt-1 text-xs text-muted-foreground">{form.description.length}/500</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Drop Start</label>
              <input type="datetime-local" value={form.drop_start_date}
                onChange={(e) => update("drop_start_date", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Drop End (72hr)</label>
              <input type="datetime-local" value={form.drop_end_date}
                onChange={(e) => update("drop_end_date", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Products ({products.length})</h2>
            <button type="button" onClick={addProduct}
              className="text-sm text-gold hover:underline">+ Add Product</button>
          </div>

          {products.map((prod, i) => (
            <div key={i} className="rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Product {i + 1}</p>
                {products.length > 1 && (
                  <button type="button" onClick={() => removeProduct(i)}
                    className="text-xs text-destructive hover:underline">Remove</button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Product Name *</label>
                  <input type="text" value={prod.name} onChange={(e) => updateProduct(i, "name", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="e.g. Twilight Wrap Dress" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Price ($) *</label>
                  <input type="number" step="0.01" min="0" value={prod.price}
                    onChange={(e) => updateProduct(i, "price", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Quantity</label>
                  <input type="number" min="1" max="20" value={prod.quantity_available}
                    onChange={(e) => updateProduct(i, "quantity_available", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSize(i, s)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                        prod.sizes_available.includes(s)
                          ? "border-gold bg-gold/10 text-foreground"
                          : "border-input text-muted-foreground hover:border-gold/50"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea value={prod.description} onChange={(e) => updateProduct(i, "description", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
                  placeholder="Product description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Materials</label>
                  <input type="text" value={prod.materials_used}
                    onChange={(e) => updateProduct(i, "materials_used", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="e.g. 100% Silk" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Care Instructions</label>
                  <input type="text" value={prod.care_instructions}
                    onChange={(e) => updateProduct(i, "care_instructions", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="e.g. Dry clean only" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Create Collection"}
        </button>
      </form>
    </div>
  );
}
