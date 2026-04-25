import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Trash2, Plus, Edit } from "lucide-react";

export const Route = createFileRoute("/dashboard/my-collections")({ component: MyCollectionsPage });

function MyCollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("collections")
      .select(`id, title, description, drop_start_date, drop_end_date, status, created_at, products(count)`)
      .eq("designer_id", user!.id)
      .order("created_at", { ascending: false });
    setCollections(data || []);
    setLoading(false);
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Delete this collection and all its products?")) return;
    setDeletingId(id);
    await supabase.from("products").delete().eq("collection_id", id);
    await supabase.from("collections").delete().eq("id", id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "draft" ? "live" : "draft";
    await supabase.from("collections").update({ status: newStatus }).eq("id", id);
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">My Collections</h1>
          <p className="mt-1 text-muted-foreground">Manage your fashion drops.</p>
        </div>
        <Link to="/dashboard/my-collections/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New Collection
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-display text-xl text-muted-foreground">No collections yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Create your first collection to start selling.</p>
          <Link to="/dashboard/my-collections/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Create Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Products</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Drop Dates</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/collections/${c.id}`} className="font-medium hover:text-gold transition-colors">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.products?.[0]?.count || 0} pieces
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                    {new Date(c.drop_start_date).toLocaleDateString()} – {new Date(c.drop_end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(c.id, c.status)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                        c.status === "live" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                          : c.status === "ended" ? "bg-muted text-muted-foreground"
                          : "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                      }`}>
                      {c.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/collections/${c.id}`}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteCollection(c.id)}
                        disabled={deletingId === c.id}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
