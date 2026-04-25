import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Countdown } from "@/components/site/Countdown";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, UserPlus, UserMinus, Instagram, Loader2 } from "lucide-react";

export const Route = createFileRoute("/designers/$designerId")({ component: DesignerProfilePage });

function DesignerProfilePage() {
  const { designerId } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [designerId]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch designer profile
    const { data: dp } = await supabase
      .from("designer_profiles")
      .select(`*, user:users!designer_profiles_user_id_fkey(id, full_name, profile_image_url, email)`)
      .eq("user_id", designerId)
      .single();
    setProfile(dp);

    // Fetch collections
    const { data: cols } = await supabase
      .from("collections")
      .select(`id, title, description, drop_start_date, drop_end_date, status, products(count)`)
      .eq("designer_id", designerId)
      .in("status", ["live", "ended"])
      .order("drop_start_date", { ascending: false });
    setCollections(cols || []);

    // Follower count
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("designer_id", designerId);
    setFollowerCount(count || 0);

    // Check if current user follows
    if (user) {
      const { data: f } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("designer_id", designerId)
        .maybeSingle();
      setIsFollowing(!!f);
    }

    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!user) { window.location.href = "/auth"; return; }
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("designer_id", designerId);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, designer_id: designerId });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-muted" />
              <div className="space-y-3">
                <div className="h-6 w-48 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </div>
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-24 text-center">
          <h1 className="font-display text-3xl">Designer not found</h1>
          <Link to="/designers" className="mt-4 inline-flex items-center gap-2 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> All Designers
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = (title: string) => {
    const images = [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop",
    ];
    return images[Math.abs(title.charCodeAt(0)) % images.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
        <Link to="/designers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> All Designers
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-gold/30">
              {profile.user?.profile_image_url ? (
                <img src={profile.user.profile_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-display text-muted-foreground">
                  {profile.user?.full_name?.[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl">{profile.user?.full_name}</h1>
              <p className="text-sm text-gold">{profile.school_name} · Class of {profile.graduation_year}</p>
              {profile.specialization && <p className="mt-1 text-sm text-muted-foreground">{profile.specialization}</p>}
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{followerCount} followers</span>
                <span className="text-muted-foreground">{collections.length} collections</span>
                {profile.instagram_handle && (
                  <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noopener"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Instagram className="h-4 w-4" /> @{profile.instagram_handle}
                  </a>
                )}
              </div>
            </div>
          </div>

          {user?.id !== designerId && (
            <button onClick={toggleFollow} disabled={followLoading}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                isFollowing
                  ? "border border-input bg-background text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}>
              {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                isFollowing ? <><UserMinus className="h-4 w-4" /> Unfollow</> : <><UserPlus className="h-4 w-4" /> Follow</>}
            </button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-8 max-w-2xl text-muted-foreground leading-relaxed">{profile.bio}</p>
        )}

        {/* Portfolio */}
        {profile.portfolio_images?.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {profile.portfolio_images.map((img: string, i: number) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        <div className="mt-12">
          <h2 className="font-display text-xl mb-6">Collections</h2>
          {collections.length === 0 ? (
            <p className="text-muted-foreground">No collections yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((c) => (
                <Link key={c.id} to={`/collections/${c.id}`} className="group rounded-xl border border-border overflow-hidden transition-all hover:border-gold/50 hover:shadow-soft">
                  <div className="aspect-[16/9] bg-muted overflow-hidden">
                    <img src={coverImage(c.title)} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg">{c.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.status === "live" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      }`}>{c.status}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <Countdown endsAt={new Date(c.drop_end_date).getTime()} />
                      {" · "}{c.products?.[0]?.count || 0} pieces
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
