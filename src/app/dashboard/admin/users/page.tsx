'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Search, Download, Plus, Filter, Loader2, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

export default function UserManagement() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  
  // Filters
  const [searchTerm, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [filterHostel, setFilterHostel] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: profiles }, { data: allocs }] = await Promise.all([
        supabase.from('profiles').select('*').order('full_name'),
        supabase.from('hostel_allocations').select('*')
      ]);
      if (profiles) setUsers(profiles);
      if (allocs) setAllocations(allocs);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole.toLowerCase();
    const matchesBranch = filterBranch === 'All' || u.branch === filterBranch;
    const matchesSem = filterSem === 'All' || u.semester?.toString() === filterSem;
    
    const isHosteller = allocations.some(a => a.student_email === u.email);
    const matchesHostel = filterHostel === 'All' || 
                         (filterHostel === 'Hosteller' && isHosteller) || 
                         (filterHostel === 'Day Scholar' && !isHosteller);

    return matchesSearch && matchesRole && matchesBranch && matchesSem && matchesHostel;
  });

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Branch', 'Semester', 'Phone', 'Hostel Status'];
    const rows = filteredUsers.map(u => [
      u.full_name,
      u.email,
      u.role,
      u.branch,
      u.semester,
      u.phone,
      allocations.some(a => a.student_email === u.email) ? 'Hosteller' : 'Day Scholar'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `VVCE_Users_Export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure? This will delete ${email} permanently from the profiles table.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', userId: id, email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("User deleted from Supabase successfully!");
        await loadData();
      } else {
        alert("Supabase Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', userId: editingUser.id, userData: editingUser })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Updated!");
        setIsModalOpen(false);
        await loadData();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#2E8B57]" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium">Manage and export all student, faculty, and staff data.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCSV} className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#2E8B57] font-medium"
            />
          </div>
          
          <FilterSelect label="Role" value={filterRole} onChange={setFilterRole} options={['All', 'Student', 'Faculty', 'Warden', 'Admin']} />
          <FilterSelect label="Branch" value={filterBranch} onChange={setFilterBranch} options={['All', 'CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'ME', 'CV']} />
          <FilterSelect label="Sem" value={filterSem} onChange={setFilterSem} options={['All', '1', '2', '3', '4', '5', '6', '7', '8']} />
          <FilterSelect label="Hostel" value={filterHostel} onChange={setFilterHostel} options={['All', 'Hosteller', 'Day Scholar']} />
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Basic Details</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Academic Info</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Residential</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(user => {
              const isHosteller = allocations.some(a => a.student_email === user.email);
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                        {user.full_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user.full_name}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-600">
                    <span className="uppercase">{user.role}</span>
                    <p className="text-[10px] text-slate-400 font-medium">{user.branch} • Sem {user.semester || 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${isHosteller ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isHosteller ? 'Hosteller' : 'Day Scholar'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#2E8B57] transition-colors"><Edit2 size={16}/></button>
                       <button onClick={() => handleDelete(user.id, user.email)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-bold italic">No records found matching these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"><X size={24} /></button>
              <h3 className="text-2xl font-black text-slate-800 mb-6">Modify User Profile</h3>
              
              <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label><input value={editingUser.full_name} onChange={e=>setEditingUser({...editingUser, full_name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Phone</label><input value={editingUser.phone || ''} onChange={e=>setEditingUser({...editingUser, phone: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Branch</label>
                  <select value={editingUser.branch || ''} onChange={e=>setEditingUser({...editingUser, branch: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                    <option value="">Select Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="ISE">ISE</option>
                    <option value="AIML">AIML</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Semester</label><input type="number" value={editingUser.semester || ''} onChange={e=>setEditingUser({...editingUser, semester: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                <div className="col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Skills</label><input value={editingUser.skills || ''} onChange={e=>setEditingUser({...editingUser, skills: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                <button type="submit" className="col-span-2 mt-4 bg-[#2E8B57] text-white font-black py-4 rounded-xl shadow-lg">Save User Changes</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="block w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#2E8B57] font-bold text-xs"
      >
        {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
