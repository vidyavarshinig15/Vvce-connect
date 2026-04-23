import Link from 'next/link';
import { User, Code, BookOpen, Lock, Building, LogOut } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/server';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // 1. Initialize server client and get logged-in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isHosteller = false;

  // 2. WARDEN VERIFICATION CHECK
  if (user?.email) {
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
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      
      {/* STUDENT SIDEBAR */}
      <aside className="w-64 bg-[#2E8B57] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-black tracking-tight">Student Portal</h2>
          <p className="text-xs uppercase tracking-widest text-emerald-200 mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <Link href="/dashboard/student/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
            <User size={20} /> <span className="font-semibold text-sm">My Profile</span>
          </Link>
          <Link href="/dashboard/student/hackathons" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
            <Code size={20} /> <span className="font-semibold text-sm">Hackathons</span>
          </Link>
          <Link href="/dashboard/student/tutoring" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors">
            <BookOpen size={20} /> <span className="font-semibold text-sm">Peer Tutoring</span>
          </Link>
          
          {/* DYNAMIC WARDEN-CONTROLLED SECTION */}
          <div className="mt-8">
            <p className="px-3 text-xs font-bold uppercase tracking-widest text-emerald-300/60 mb-2">Hostel Services</p>
            
            {isHosteller ? (
              // UNLOCKED STATE: They are an official Hosteller
              <Link href="/dashboard/student/hostel" className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all shadow-sm group">
                <div className="flex items-center gap-3">
                  <Building size={20} className="text-emerald-100 group-hover:text-white" /> 
                  <span className="font-bold text-sm text-white">My Hostel</span>
                </div>
              </Link>
            ) : (
              // LOCKED STATE: They are a Day Scholar (Not in the allocations table)
              <div className="flex items-center justify-between p-3 rounded-xl opacity-50 cursor-not-allowed bg-black/10 border border-transparent" title="Only available to students assigned a room by the Warden.">
                <div className="flex items-center gap-3">
                  <Building size={20} /> <span className="font-semibold text-sm">Hostel Portal</span>
                </div>
                <Lock size={14} className="text-emerald-200" />
              </div>
            )}
          </div>
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