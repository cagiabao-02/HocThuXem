import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  addXP: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  // Initialize auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) await fetchProfile(user.id);
    return { error: error?.message ?? null };
  };

  const addXP = async (amount: number) => {
    if (!user || !profile) return;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;

    // Update streak based on calendar date difference
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = profile.last_activity_date;
    let newStreak = profile.current_streak || 0;

    if (!lastActivity || newStreak === 0) {
      // First activity ever or streak was broken/zero
      newStreak = 1;
    } else {
      const [todayY, todayM, todayD] = today.split('-').map(Number);
      const [lastY, lastM, lastD] = lastActivity.split('-').map(Number);
      const diffDays = Math.round((Date.UTC(todayY, todayM - 1, todayD) - Date.UTC(lastY, lastM - 1, lastD)) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      } else if (diffDays === 0) {
        // Same day activity: maintain at least 1
        newStreak = Math.max(newStreak, 1);
      }
    }

    const maxStreak = Math.max(newStreak, profile.max_streak || 0);

    // Optimistic UI update so flame lights up and XP increases instantly
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            xp: newXP,
            level: newLevel,
            current_streak: newStreak,
            max_streak: maxStreak,
            last_activity_date: today,
          }
        : null
    );

    // Persist to database
    await updateProfile({
      xp: newXP,
      level: newLevel,
      current_streak: newStreak,
      max_streak: maxStreak,
      last_activity_date: today,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
        addXP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
