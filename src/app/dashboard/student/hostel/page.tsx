'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/src/hooks/useUser';
import { Building, Bell, PlusCircle, Clock, CheckCircle2, Loader2, Wrench, MessageSquare } from 'lucide-react';
import { HostelAllocation, HostelAnnouncement, HostelComplaint } from '@/src/types/database';

export default function StudentHostelDashboard() {
  const { userId, userProfile, loading: userLoading, supabase } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('complaints');
  
  const [allocation, setAllocation] = useState<HostelAllocation | null>(null);
  const [announcements, setAnnouncements] = useState<HostelAnnouncement[]>([]);
  const [myComplaints, setMyComplaints] = useState<HostelComplaint[]>([]);
  
  const [complaintForm, setComplaintForm] = useState({ issue_type: 'Food / Mess', description: '' });

  useEffect(() => {
    if (!userProfile?.email) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: allocData, error: allocError } = await supabase
          .from('hostel_allocations')
          .select('*')
          .eq('student_email', userProfile.email)
          .single();

        if (allocError) throw allocError;

        if (allocData && isMounted) {
          setAllocation(allocData as HostelAllocation);

          const [annRes, compRes] = await Promise.all([
            supabase
              .from('hostel_announcements')
              .select('*')
              .or(`hostel_name.eq."${allocData.hostel_name}",hostel_name.eq."All Hostels"`)
              .order('created_at', { ascending: false }),
            supabase
              .from('hostel_complaints')
              .select('*')
              .eq('student_id', userId)
              .order('created_at', { ascending: false })
          ]);

          if (annRes.error) throw annRes.error;
          if (compRes.error) throw compRes.error;

          if (isMounted) {
            setAnnouncements((annRes.data ?? []) as HostelAnnouncement[]);
            setMyComplaints((compRes.data ?? []) as HostelComplaint[]);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [userProfile?.email, userId, supabase]);

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocation || !userProfile?.email || !userId) return;

    const { error } = await supabase.from('hostel_complaints').insert([{
      student_id: userId,
      student_email: userProfile.email,
      issue_type: complaintForm.issue_type,
      description: complaintForm.description,
      hostel_name: allocation.hostel_name
    }]);

    if (!error) {
      alert("Complaint registered successfully! The Warden has been notified.");
      setComplaintForm({ issue_type: 'Food / Mess', description: '' });
      const { data: updatedComplaints } = await supabase
        .from('hostel_complaints')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });
      if (updatedComplaints) setMyComplaints(updatedComplaints as HostelComplaint[]);
    } else {
      alert("Error submitting complaint: " + error.message);
    }
  };

  if (userLoading || loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#738a6e]" size={40} /></div>;

  if (!allocation) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <Building size={64} className="mb-4 opacity-20" />
        <h2 className="text-2xl font-black text-slate-800">Not Assigned to a Hostel</h2>
        <p className="mt-2">Please contact the Chief Warden to complete your room allocation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Hostel Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your stay and request maintenance.</p>
      </div>

      <div className="bg-[#738a6e] rounded-3xl p-6 md:p-8 text-[#FAF9F6] shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-700">
        <div>
          <p className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-1">Official Residence</p>
          <h2 className="text-2xl font-black">{allocation.hostel_name}</h2>
          <div className="flex items-center gap-4 mt-3">
            <span className="bg-[#FAF9F6]/20 px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2">
              <Building size={16}/> Room {allocation.room_number}
            </span>
            <span className="text-emerald-100 text-sm font-medium">Logged in as {allocation.student_name}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#FAF9F6] pb-px">
        <button onClick={() => setActiveTab('complaints')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'complaints' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}>
          <Wrench size={18}/> Maintenance & Complaints
        </button>
        <button onClick={() => setActiveTab('announcements')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'announcements' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}>
          <Bell size={18}/> Warden Announcements {announcements.length > 0 && <span className="bg-red-500 text-[#FAF9F6] text-[10px] px-2 py-0.5 rounded-full">{announcements.length}</span>}
        </button>
      </div>

      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-[#FAF9F6] shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <PlusCircle className="text-[#738a6e]" size={20} /> Raise an Issue
              </h3>
              <form onSubmit={handleRaiseComplaint} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Issue Category *</label>
                  <select required value={complaintForm.issue_type} onChange={e=>setComplaintForm({...complaintForm, issue_type: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] font-semibold text-slate-700">
                    <option value="Food / Mess">Food & Mess Issues</option>
                    <option value="Electrical">Electrical (Lights, Fans, Sockets)</option>
                    <option value="Plumbing">Plumbing (Water, Taps, Washrooms)</option>
                    <option value="Carpentry">Carpentry (Beds, Cupboards, Doors)</option>
                    <option value="Cleaning">Cleaning & Housekeeping</option>
                    <option value="Internet">Wi-Fi / Internet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Detailed Description *</label>
                  <textarea required rows={4} value={complaintForm.description} onChange={e=>setComplaintForm({...complaintForm, description: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] resize-none" placeholder="E.g., The food quality today was poor..." />
                </div>
                <button type="submit" className="w-full bg-[#738a6e] text-[#FAF9F6] font-black py-4 rounded-xl hover:bg-[#94A185] mt-2 shadow-lg shadow-emerald-600/20">
                  Submit to Warden
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-black text-slate-800 mb-4">My Complaint History</h3>
            {myComplaints.length === 0 ? (
              <div className="bg-[#FAF9F6] border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-500">
                You haven&apos;t raised any complaints yet.
              </div>
            ) : myComplaints.map(c => (
              <div key={c.id} className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#FAF9F6] shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FAF9F6]/60 text-slate-700 font-black px-3 py-1 rounded text-[10px] uppercase tracking-widest border border-[#FAF9F6]">{c.issue_type}</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 ${
                    c.status === 'Pending' ? 'bg-red-50 text-red-700 border border-red-100' :
                    c.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-[#FAF9F6]/40 text-[#738a6e] border border-emerald-100'
                  }`}>
                    {c.status === 'Pending' ? <Clock size={12}/> : c.status === 'In Progress' ? <Loader2 className="animate-spin" size={12}/> : <CheckCircle2 size={12}/>}
                    {c.status}
                  </span>
                </div>
                
                <h4 className="font-semibold text-slate-800 text-sm mb-4">&quot;{c.description}&quot;</h4>

                {c.warden_response ? (
                  <div className="bg-[#FAF9F6]/40/50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-black text-[#738a6e] uppercase tracking-widest mb-1 flex items-center gap-1"><MessageSquare size={12}/> Message from Warden</p>
                    <p className="text-sm font-medium text-slate-800">&quot;{c.warden_response}&quot;</p>
                  </div>
                ) : (
                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#FAF9F6]/50 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400"/>
                    <p className="text-xs font-semibold text-slate-500">Waiting for Warden review...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="max-w-3xl space-y-4">
          <h3 className="text-lg font-black text-slate-800 mb-4">Hostel Notice Board</h3>
          {announcements.length === 0 ? (
            <div className="bg-[#FAF9F6] border border-[#FAF9F6] rounded-3xl p-12 text-center text-slate-500">
              No recent announcements.
            </div>
          ) : announcements.map(a => (
            <div key={a.id} className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#FAF9F6] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#738a6e]"></div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-black text-slate-800">{a.title}</h4>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-[#FAF9F6] px-3 py-1 rounded-lg border">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
