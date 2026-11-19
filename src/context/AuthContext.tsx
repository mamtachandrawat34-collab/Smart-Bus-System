import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function roleFromSession(session: Session | null): UserRole {
  const jwtRole = session?.user?.app_metadata?.role;
  if (jwtRole === 'admin') return 'admin';
  return 'student';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, display_name')
      .eq('id', uid)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      role: data.role as UserRole,
      displayName: data.display_name ?? '',
    };
  }, []);

  // Initial session load + auth state listener.
  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        const p = await loadProfile(data.session.user.id);
        if (active) setProfile(p);
      }
      if (active) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user?.id) {
          const p = await loadProfile(newSession.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<{ error?: string }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName ?? '' } },
      });
      if (error) return { error: error.message };
      // Update display_name on the profile row created by the trigger.
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ display_name: displayName ?? '' })
          .eq('id', data.user.id);
      }
      return {};
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const role = session ? roleFromSession(session) : null;

  const value: AuthContextValue = {
    session,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
