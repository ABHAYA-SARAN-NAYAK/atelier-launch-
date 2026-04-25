import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Countdown } from "@/components/site/Countdown";
import { Search, SlidersHorizontal, X } from "lucide-react";

export const Route = createFileRoute("/collections")({ component: CollectionsPage });

interface CollectionRow {
  id: string;
  title: string;
  description: string | null;
  drop_start_date: string;
  drop_end_date: string;
  status: string;
  designer: { id: string; full_name: string; profile_image_url: string | null } | null;
  products: { count: number }[];
}

function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("ending_soon");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [sort]);

  const fetchCollections = async () => {
    setLoading(true);
    let query = supabase
      .from("collections")
      .select(`id, title, description, drop_start_date, drop_end_date, status,
        designer:users!collections_designer_id_fkey(id, full_name, profile_image_url),
        products(count)`)
      .in("status", ["live", "ended"]);

    if (sort === "ending_soon") query = query.order("drop_end_date", { ascending: true });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "oldest") query = query.order("created_at", { ascending: true });

    const { data } = await query.limit(24);
    setCollections((data as unknown as CollectionRow[]) || []);
    setLoading(false);
  };

  const filtered = collections.filter((c) =>
    search === "" || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.designer?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get a cover image for the collection from Unsplash based on title
  const coverImage = (title: string) => {
    const hash = title.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const images = [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485518882345-15568b007407?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop",
    ];
    return images[Math.abs(hash) % images.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Explore</p>
          <h1 className="mt-2 font-display text-4xl font-light sm:text-5xl">Collections</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Browse limited-edition drops from the world's most promising fashion students.
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collections or designers..."
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm hover:bg-muted sm:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold">
              <option value="ending_soon">Ending Soon</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-xl bg-muted" />
                <div className="mt-4 h-5 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-muted-foreground">No collections found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const endMs = new Date(c.drop_end_date).getTime();
              const productCount = c.products?.[0]?.count || 0;
              return (
                <Link key={c.id} to={`/collections/${c.id}`} className="group cursor-pointer">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                    <img src={coverImage(c.title)} alt={c.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium backdrop-blur">
                      <Countdown endsAt={endMs} />
                    </div>
                    {productCount > 0 && (
                      <div className="absolute right-3 top-3 rounded-full bg-coral/90 px-3 py-1 text-[11px] font-medium text-coral-foreground backdrop-blur">
                        {productCount} pieces
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-display text-xl leading-tight">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.designer?.full_name || "Unknown Designer"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
