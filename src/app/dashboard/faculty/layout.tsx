import { User, Calendar, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/src/utils/supabase/server';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = user?.user_metadata?.full_name || 'Faculty';
  let userRole = 'Faculty';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      profileName = profile.full_name;
      userRole = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]">
      {/* FACULTY SIDEBAR */}
      <aside className="w-64 bg-[#738a6e] text-[#FAF9F6] flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-100" size={24} />
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none text-[#FAF9F6]">Faculty</h2>
              <p className="text-[10px] uppercase tracking-widest text-emerald-200 mt-1">Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link href="/dashboard/faculty" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF9F6]/10 transition-colors group">
            <LayoutDashboard size={20} className="text-emerald-100 group-hover:text-[#FAF9F6]" /> 
            <span className="font-bold text-sm text-[#FAF9F6]">Venue Booking</span>
          </Link>
          <Link href="/dashboard/faculty/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF9F6]/10 transition-colors group">
            <User size={20} className="text-emerald-100 group-hover:text-[#FAF9F6]" /> 
            <span className="font-bold text-sm text-[#FAF9F6]">My Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* USER INFO DISPLAY */}
          <div className="px-3 py-4 bg-black/10 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100/20 flex items-center justify-center">
              <UserCircle size={20} className="text-emerald-100" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{profileName}</p>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold bg-[#FAF9F6]/10 px-1 rounded text-emerald-100 uppercase">{userRole}</span>
                <p className="text-[10px] text-emerald-200/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/10 text-emerald-100 hover:text-[#FAF9F6] transition-colors group">
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
