'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { NotificationsService } from '@/src/services/supabase/notifications.service';
import { Bell, X, Info } from 'lucide-react';

interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    async function fetchNotifications() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data } = await NotificationsService.getNotifications(user.id);

      if (data) {
        setNotifications((data as AppNotification[]).slice(0, 10));
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    }

    fetchNotifications();

    // REAL-TIME LISTENER: Listen for new notifications for the logged-in user
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, (payload) => {
          setNotifications(prev => [payload.new as AppNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAllAsRead = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await NotificationsService.markAllAsRead(user.id);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => { setIsOpen(!isOpen); markAllAsRead(); }} className="relative p-2 text-slate-500 hover:bg-[#FAF9F6]/60 rounded-full transition">
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-[#FAF9F6] text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#FAF9F6] border border-[#FAF9F6] shadow-2xl rounded-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-[#FAF9F6]/50 flex justify-between items-center bg-[#FAF9F6]">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">Notifications</h3>
            <button onClick={() => setIsOpen(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">No notifications yet.</p>
            ) : notifications.map(n => (
              <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-[#FAF9F6] transition ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                <div className="flex gap-3">
                  <div className="mt-1 text-[#738a6e]"><Info size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
