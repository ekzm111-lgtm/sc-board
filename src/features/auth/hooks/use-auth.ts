'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/server/supabase/client';
import { UserProfile } from '@/types/database';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: currentProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          setProfile(currentProfile || null);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Failed to load user auth:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: currentProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          setProfile(currentProfile || null);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isTeacher: profile?.role === 'teacher' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
    isApproved: profile?.approved ?? false,
    signOut,
  };
}
