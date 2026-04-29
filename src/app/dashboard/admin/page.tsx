import { createClient } from '@/src/utils/supabase/server';
import { Users, UserCheck, ShieldCheck, Activity, Search } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Fetch real data counts
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: facultyCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'faculty');
  const { count: wardenCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'warden');

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header>
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 mb-4">
          <UserCheck size={12}/> Authorized Personnel Only
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Administration</h1>
        <p className="text-slate-500 font-medium">Global management for VVCE Connect ecosystem.</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Students" value={studentCount || 0} icon={<Users className="text-blue-500" />} />
        <StatCard label="Faculty" value={facultyCount || 0} icon={<ShieldCheck className="text-emerald-500" />} />
        <StatCard label="Wardens" value={wardenCount || 0} icon={<Activity className="text-purple-500" />} />
        <StatCard label="System Status" value="Online" icon={<Activity className="text-green-500" />} status />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT USER LIST */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Recent User Activity</h3>
              <button className="text-xs font-bold text-[#738a6e] hover:underline">View All Users</button>
           </div>
           
           <div className="bg-[#FAF9F6] rounded-[2rem] border border-[#FAF9F6] overflow-hidden shadow-sm">
             <table className="w-full text-left border-collapse">
               <thead className="bg-[#FAF9F6] border-b border-[#FAF9F6]/50">
                 <tr>
                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">User Details</th>
                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                   <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Last Sync</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {recentUsers?.map(user => (
                   <tr key={user.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                     <td className="p-4">
                       <p className="font-bold text-slate-800 text-sm">{user.full_name}</p>
                       <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                     </td>
                     <td className="p-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                          user.role === 'admin' ? 'bg-red-50 text-red-600' :
                          user.role === 'faculty' ? 'bg-[#FAF9F6]/40 text-emerald-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {user.role}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                       <p className="text-xs font-bold text-slate-400">{new Date(user.updated_at).toLocaleDateString()}</p>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* ADMIN TOOLS PANEL */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">Quick Actions</h3>
          <div className="space-y-4">
            <AdminAction title="Force Refresh" desc="Invalidate global caches" />
            <AdminAction title="Export DB" desc="Download profiles as CSV" />
            <AdminAction title="System Audit" desc="Review security logs" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, status = false }: { label: string, value: any, icon: React.ReactNode, status?: boolean }) {
  return (
    <div className="bg-[#FAF9F6] p-6 rounded-[2rem] border border-[#FAF9F6] shadow-sm">
      <div className="w-10 h-10 bg-[#FAF9F6] rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {status && <div className="w-2 h-2 bg-[#FAF9F6]/400 rounded-full animate-ping"></div>}
      </div>
    </div>
  );
}

function AdminAction({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#FAF9F6] shadow-sm hover:border-[#738a6e] transition-colors cursor-pointer group">
       <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#738a6e] transition-colors">{title}</h4>
       <p className="text-xs text-slate-400 font-medium">{desc}</p>
    </div>
  );
}
