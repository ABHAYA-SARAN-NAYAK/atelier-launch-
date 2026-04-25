import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Search } from "lucide-react";

export const Route = createFileRoute("/designers")({ component: DesignersPage });

function DesignersPage() {
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("designer_profiles")
      .select(`*, user:users!designer_profiles_user_id_fkey(id, full_name, profile_image_url)`)
      .eq("verification_status", "verified")
      .limit(30);
    setDesigners(data || []);
    setLoading(false);
  };

  const filtered = designers.filter((d) =>
    search === "" ||
    d.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.school_name?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarFallback = (name: string) => {
    const images = [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop",
    ];
    return images[Math.abs(name.charCodeAt(0)) % images.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Community</p>
          <h1 className="mt-2 font-display text-4xl font-light sm:text-5xl">Our Designers</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Meet the next generation of fashion talent — verified students from the world's best fashion schools.
          </p>
        </div>

        <div className="mb-8 max-w-md relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designers or schools..."
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-muted-foreground">No designers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <Link key={d.id} to={`/designers/${d.user_id}`}
                className="group rounded-xl border border-border p-6 transition-all hover:border-gold/50 hover:shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                    <img
                      src={d.user?.profile_image_url || avatarFallback(d.user?.full_name || "A")}
                      alt={d.user?.full_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg truncate">{d.user?.full_name}</h3>
                    <p className="text-sm text-gold">{d.school_name}</p>
                    {d.specialization && (
                      <p className="text-xs text-muted-foreground mt-1">{d.specialization}</p>
                    )}
                  </div>
                </div>
                {d.bio && (
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{d.bio}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Class of {d.graduation_year}</span>
                  {d.instagram_handle && <span>@{d.instagram_handle}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
