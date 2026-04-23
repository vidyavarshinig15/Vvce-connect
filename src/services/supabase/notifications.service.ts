import { createClient } from '@/src/utils/supabase/client';

export const NotificationsService = {
  async getNotifications(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createNotification(userId: string, title: string, message: string, type: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      })
      .select()
      .single();

    return { data, error };
  },

  async markAsRead(userId: string, notificationId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    return { error };
  },

  async markAllAsRead(userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { error };
  },
};