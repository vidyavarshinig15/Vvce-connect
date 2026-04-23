import { createClient } from '@/src/utils/supabase/client';

const supabase = createClient();

export const ProfileService = {
  async getCurrentProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  async getProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  },
};
