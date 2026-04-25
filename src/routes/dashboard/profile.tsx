import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Save, Camera } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const isDesigner = user?.user_type === "student" || user?.user_type === "pro_designer";

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });
  const [designerForm, setDesignerForm] = useState({
    bio: "",
    school_name: "",
    graduation_year: 2026,
    specialization: "",
    instagram_handle: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setForm({ full_name: user.full_name, email: user.email });
    if (isDesigner) fetchDesignerProfile();
    else setLoading(false);
  }, [user]);

  const fetchDesignerProfile = async () => {
    const { data } = await supabase
      .from("designer_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();
    if (data) {
      setDesignerForm({
        bio: data.bio || "",
        school_name: data.school_name || "",
        graduation_year: data.graduation_year || 2026,
        specialization: data.specialization || "",
        instagram_handle: data.instagram_handle || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // Update user profile
    const { error: userErr } = await supabase
      .from("users")
      .update({ full_name: form.full_name })
      .eq("id", user!.id);

    if (userErr) {
      setMessage("Error: " + userErr.message);
      setSaving(false);
      return;
    }

    // Update designer profile
    if (isDesigner) {
      const { error: dpErr } = await supabase
        .from("designer_profiles")
        .update({
          bio: designerForm.bio || null,
          school_name: designerForm.school_name,
          graduation_year: designerForm.graduation_year,
          specialization: designerForm.specialization || null,
          instagram_handle: designerForm.instagram_handle || null,
        })
        .eq("user_id", user!.id);

      if (dpErr) {
        setMessage("Error: " + dpErr.message);
        setSaving(false);
        return;
      }
    }

    await refreshUser();
    setMessage("Profile updated successfully!");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">Profile Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your personal information.</p>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm ${
            message.startsWith("Error") ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
          }`}>
            {message}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 rounded-full bg-muted overflow-hidden">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-display text-muted-foreground">
                {user?.full_name?.[0]}
              </div>
            )}
            <button type="button"
              className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-background" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.user_type?.replace("_", " ")}</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="space-y-4 rounded-xl border border-border p-6">
          <h2 className="font-display text-lg">Basic Information</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full Name</label>
            <input type="text" required value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input type="email" value={form.email} disabled
              className="w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-sm text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
        </div>

        {/* Designer-specific */}
        {isDesigner && (
          <div className="space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-6">
            <h2 className="font-display text-lg">Designer Profile</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bio</label>
              <textarea value={designerForm.bio}
                onChange={(e) => setDesignerForm((p) => ({ ...p, bio: e.target.value }))}
                rows={4} maxLength={500}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
                placeholder="Tell your creative story..." />
              <p className="mt-1 text-xs text-muted-foreground">{designerForm.bio.length}/500</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Fashion School</label>
                <input type="text" value={designerForm.school_name}
                  onChange={(e) => setDesignerForm((p) => ({ ...p, school_name: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Graduation Year</label>
                <input type="number" value={designerForm.graduation_year}
                  onChange={(e) => setDesignerForm((p) => ({ ...p, graduation_year: parseInt(e.target.value) }))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Specialization</label>
                <select value={designerForm.specialization}
                  onChange={(e) => setDesignerForm((p) => ({ ...p, specialization: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20">
                  <option value="">Select...</option>
                  <option>Womenswear</option>
                  <option>Menswear</option>
                  <option>Accessories</option>
                  <option>Streetwear</option>
                  <option>Avant-garde</option>
                  <option>Knitwear</option>
                  <option>Sustainable Fashion</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                  <input type="text" value={designerForm.instagram_handle}
                    onChange={(e) => setDesignerForm((p) => ({ ...p, instagram_handle: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-8 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="yourhandle" />
                </div>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
