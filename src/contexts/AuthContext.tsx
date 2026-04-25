import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  user_type: "buyer" | "student" | "pro_designer";
  profile_image_url?: string;
  created_at: string;
}

interface AuthState {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    user_type: "buyer" | "student";
    school_name?: string;
    graduation_year?: number;
    specialization?: string;
  }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (error || !data) return null;
    return data as AppUser;
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user);
      setState({ user: profile, session, loading: false });
    } else {
      setState({ user: null, session: null, loading: false });
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Initial session load
    refreshUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setState({ user: profile, session, loading: false });
        } else {
          setState({ user: null, session: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, refreshUser]);

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    user_type: "buyer" | "student";
    school_name?: string;
    graduation_year?: number;
    specialization?: string;
  }) => {
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          user_type: data.user_type,
          school_name: data.school_name,
          graduation_year: data.graduation_year,
          specialization: data.specialization,
        },
      },
    });

    if (authError) return { error: authError.message };

    // Wait a moment for the trigger to create the profile, then refresh
    await new Promise((r) => setTimeout(r, 1000));
    await refreshUser();
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
