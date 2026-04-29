import Link from 'next/link';
import { User, Code, BookOpen, Lock, Building, LogOut, UserCircle } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/server';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // 1. Initialize server client and get logged-in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isHosteller = false;
  let profileName = user?.user_metadata?.full_name || 'Student';
  let userRole = 'Student';

  // 2. WARDEN VERIFICATION CHECK & Profile Data
  if (user?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      profileName = profile.full_name;
      userRole = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
    }

    // Check if the Warden has allocated a room to this specific email address
    const { data: allocation } = await supabase
      .from('hostel_allocations')
      .select('id')
      .eq('student_email', user.email)
      .single();

    if (allocation) {
      isHosteller = true;
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]">
      
      {/* STUDENT SIDEBAR */}
      <aside className="w-64 bg-[#738a6e] text-[#FAF9F6] flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-[#FAF9F6]/10">
          <h2 className="text-xl font-black tracking-tight">Student Portal</h2>
          <p className="text-xs uppercase tracking-widest text-brand-secondary mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <Link href="/dashboard/student/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF9F6]/10 transition-colors">
            <User size={20} /> <span className="font-semibold text-sm">My Profile</span>
          </Link>
          <Link href="/dashboard/student/hackathons" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF9F6]/10 transition-colors">
            <Code size={20} /> <span className="font-semibold text-sm">Hackathons</span>
          </Link>
          <Link href="/dashboard/student/tutoring" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF9F6]/10 transition-colors">
            <BookOpen size={20} /> <span className="font-semibold text-sm">Peer Tutoring</span>
          </Link>
          
          {/* DYNAMIC WARDEN-CONTROLLED SECTION */}
          <div className="mt-8">
            <p className="px-3 text-xs font-bold uppercase tracking-widest text-brand-background/60 mb-2">Hostel Services</p>
            
            {isHosteller ? (
              // UNLOCKED STATE: They are an official Hosteller
              <Link href="/dashboard/student/hostel" className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F6]/10 border border-[#FAF9F6]/20 hover:bg-[#FAF9F6]/20 transition-all shadow-sm group">
                <div className="flex items-center gap-3">
                  <Building size={20} className="text-brand-background group-hover:text-[#FAF9F6]" /> 
                  <span className="font-bold text-sm text-[#FAF9F6]">My Hostel</span>
                </div>
              </Link>
            ) : (
              // LOCKED STATE: They are a Day Scholar (Not in the allocations table)
              <div className="flex items-center justify-between p-3 rounded-xl opacity-50 cursor-not-allowed bg-black/10 border border-transparent" title="Only available to students assigned a room by the Warden.">
                <div className="flex items-center gap-3">
                  <Building size={20} /> <span className="font-semibold text-sm">Hostel Portal</span>
                </div>
                <Lock size={14} className="text-brand-background" />
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-[#FAF9F6]/10 space-y-2">
          {/* USER INFO DISPLAY */}
          <div className="px-3 py-4 bg-black/10 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-background/20 flex items-center justify-center">
              <UserCircle size={20} className="text-brand-background" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{profileName}</p>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold bg-[#FAF9F6]/10 px-1 rounded text-brand-background uppercase">{userRole}</span>
                <p className="text-[10px] text-brand-secondary/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/10 text-brand-background hover:text-[#FAF9F6] transition-colors group">
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
