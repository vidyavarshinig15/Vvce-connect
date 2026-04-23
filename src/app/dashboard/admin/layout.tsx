import { redirect } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, Users, ShieldAlert, LogOut, Settings } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // STRICT SECURITY CHECK
  if (!user || user.email !== 'vvceconnect.official@gmail.com') {
    redirect('/');
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-[#2E8B57] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-emerald-100">
            <ShieldAlert size={24} />
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none text-white">Admin</h2>
              <p className="text-[10px] uppercase tracking-widest text-emerald-200 mt-1">Super User</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link href="/dashboard/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group">
            <LayoutDashboard size={20} className="text-emerald-100 group-hover:text-white" /> 
            <span className="font-bold text-sm text-white">Overview</span>
          </Link>
          <Link href="/dashboard/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group">
            <Users size={20} className="text-emerald-100 group-hover:text-white" /> 
            <span className="font-bold text-sm text-white">User Management</span>
          </Link>
          <Link href="/dashboard/admin/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group">
            <Settings size={20} className="text-emerald-100 group-hover:text-white" /> 
            <span className="font-bold text-sm text-white">System Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/10 text-emerald-100 hover:text-white transition-colors group">
              <LogOut size={20} />
              <span className="font-bold text-sm">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
