import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/logo-atelier.jpg";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate({ to: "/dashboard" });
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-hero p-12 lg:flex">
        <a href="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Atelier Launch" className="h-9 w-9 rounded-md object-cover" />
          <span className="font-display text-lg tracking-tight">Atelier Launch</span>
        </a>
        <div>
          <h1 className="font-display text-5xl font-light leading-tight">
            Wear tomorrow's <em className="text-gold">fashion</em> today.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Join a community of visionary fashion students and discover limited-edition pieces you won't find anywhere else.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Atelier Launch. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <a href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back
          </a>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-medium">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your dashboard."
                : "Join Atelier Launch as a buyer or designer."}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === "login" ? <LoginForm /> : <SignupForm />}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">Password</label>
        <div className="relative">
          <input
            id="login-password"
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sign In"}
      </button>
    </form>
  );
}

function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    user_type: "buyer" as "buyer" | "student",
    school_name: "",
    graduation_year: new Date().getFullYear() + 1,
    specialization: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await signUp({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      user_type: form.user_type,
      school_name: form.user_type === "student" ? form.school_name : undefined,
      graduation_year: form.user_type === "student" ? form.graduation_year : undefined,
      specialization: form.user_type === "student" ? form.specialization : undefined,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <div>
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium">Full Name</label>
        <input id="signup-name" type="text" required value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          placeholder="Your full name" />
      </div>
      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="signup-email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          placeholder="you@example.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="signup-pw" className="mb-1.5 block text-sm font-medium">Password</label>
          <div className="relative">
            <input id="signup-pw" type={showPw ? "text" : "password"} required value={form.password} onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="8+ characters" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="signup-cpw" className="mb-1.5 block text-sm font-medium">Confirm</label>
          <input id="signup-cpw" type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="Re-enter" />
        </div>
      </div>

      {/* User type */}
      <div>
        <label className="mb-2 block text-sm font-medium">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          {(["buyer", "student"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update("user_type", t)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                form.user_type === t
                  ? "border-gold bg-gold/10 text-foreground"
                  : "border-input text-muted-foreground hover:border-gold/50"
              }`}
            >
              {t === "buyer" ? "👗 Fashion Buyer" : "🎨 Student Designer"}
            </button>
          ))}
        </div>
      </div>

      {/* Designer-specific fields */}
      {form.user_type === "student" && (
        <div className="space-y-4 rounded-lg border border-gold/30 bg-gold/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gold">Designer Details</p>
          <div>
            <label htmlFor="school" className="mb-1.5 block text-sm font-medium">Fashion School</label>
            <input id="school" type="text" required value={form.school_name} onChange={(e) => update("school_name", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="e.g. Central Saint Martins" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="grad-year" className="mb-1.5 block text-sm font-medium">Graduation Year</label>
              <input id="grad-year" type="number" min="2024" max="2032" value={form.graduation_year}
                onChange={(e) => update("graduation_year", parseInt(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
            </div>
            <div>
              <label htmlFor="spec" className="mb-1.5 block text-sm font-medium">Specialization</label>
              <select id="spec" value={form.specialization} onChange={(e) => update("specialization", e.target.value)}
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
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Create Account"}
      </button>
    </form>
  );
}
