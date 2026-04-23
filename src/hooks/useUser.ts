import { useState, useEffect } from 'react';
// FIX: Using bulletproof relative paths (../ means go up one folder)
import { createClient } from '../utils/supabase/client';
import { Profile } from '../types/database';
import { ProfileService } from '../services/supabase/profile.service';

export function useUser() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await ProfileService.getCurrentProfile(user.id);
        if (profile) setUserProfile(profile as Profile);
      }
      setLoading(false);
    }
    loadUser();
  }, [supabase]);

  return { userId, userProfile, loading, supabase };
}