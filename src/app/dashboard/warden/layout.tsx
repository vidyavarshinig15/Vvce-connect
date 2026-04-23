import { User, Shield, Building, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function WardenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* WARDEN SIDEBAR */}
      <aside className="w-64 bg-[#2E8B57] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-100" size={24} />
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none text-white">Warden</h2>
              <p className="text-[10px] uppercase tracking-widest text-emerald-200 mt-1">Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link href="/dashboard/warden" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group">
            <Building size={20} className="text-emerald-100 group-hover:text-white" /> 
            <span className="font-bold text-sm text-white">Dashboard</span>
          </Link>
          <Link href="/dashboard/warden/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group">
            <User size={20} className="text-emerald-100 group-hover:text-white" /> 
            <span className="font-bold text-sm text-white">My Profile</span>
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
