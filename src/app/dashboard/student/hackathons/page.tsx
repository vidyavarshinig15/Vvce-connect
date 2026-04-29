'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/src/hooks/useUser';
import { PlusCircle, CheckCircle2, XCircle, Loader2, Send, User, Eye, Trash2 } from 'lucide-react';
import { Profile, HackathonTeam, HackathonRequest } from '@/src/types/database';

export default function HackathonDashboard() {
  const { userId, userProfile, loading: userLoading, supabase } = useUser();
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);
  
  const [availableTeams, setAvailableTeams] = useState<HackathonTeam[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<HackathonRequest[]>([]);
  const [myRequestStatus, setMyRequestStatus] = useState<Record<string, string>>({}); 
  
  const [createForm, setCreateForm] = useState({
    hackathon_name: '', team_name: '', start_date: '', end_date: '',
    required_skills: '', target_year: 'Any', total_size: 4, spots_open: 3
  });

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<HackathonTeam | null>(null);
  const [joinForm, setJoinForm] = useState({ contact_email: '', skills: '', project_count: 0, year_of_study: '1' });

  const [viewProfileModalOpen, setViewProfileModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Profile | null>(null);

  /** * FIXED LOADDATA FUNCTION
   * Added proper error handling and JSON parsing checks
   */
  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/hackathons/overview');
      
      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server responded with status: ${response.status}`);
      }

      // Safe state updates with fallback values
      setAvailableTeams((data?.availableTeams ?? []) as HackathonTeam[]);
      setIncomingRequests((data?.incomingRequests ?? []) as HackathonRequest[]);
      setMyRequestStatus((data?.myRequestStatus ?? {}) as Record<string, string>);
      
    } catch (error: any) {
      console.error("Fetch Error:", error);
      // Don't alert on every minor failure to avoid spamming the user
      // but ensure state is reset so UI doesn't hang
      setAvailableTeams([]);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Removed supabase from deps as it's not used inside loadData

  useEffect(() => { 
    if (userId) loadData(); 
  }, [userId, loadData]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const { error } = await supabase.from('hackathon_teams').insert([{ 
      name: createForm.team_name, 
      hackathon_name: createForm.hackathon_name, 
      description: 'N/A', 
      start_date: createForm.start_date, 
      end_date: createForm.end_date, 
      required_skills: createForm.required_skills,
      total_size: createForm.total_size, 
      spots_open: createForm.spots_open, 
      target_year: createForm.target_year,
      creator_id: userId,
      status: 'Recruiting'
    }]);
    
    if (!error) {
      alert("Team Published successfully!");
      setCreateForm({ hackathon_name: '', team_name: '', start_date: '', end_date: '', required_skills: '', target_year: 'Any', total_size: 4, spots_open: 3});
      loadData(); 
      setActiveTab('browse');
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team? This will also delete all pending join requests.")) return;
    
    const { error } = await supabase.from('hackathon_teams').delete().eq('id', teamId);
    if (!error) {
      alert("Team successfully deleted.");
      loadData();
    } else {
      alert("Error deleting team: " + error.message);
    }
  };

  const submitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !userId) return;

    const { error } = await supabase.from('hackathon_requests').insert([{ 
      team_id: selectedTeam.id, 
      student_id: userId,
      contact_email: joinForm.contact_email, 
      applicant_skills: joinForm.skills,
      project_count: joinForm.project_count, 
      year_of_study: joinForm.year_of_study,
      status: 'Pending'
    }]);
    
    if (!error) {
      // Send notification to team owner
      await supabase.from('notifications').insert([{
        user_id: selectedTeam.creator_id,
        title: 'New Team Request',
        message: `${userProfile?.full_name || 'A student'} wants to join ${selectedTeam.name}`,
        type: 'hackathon'
      }]);

      alert("Application sent to team leader!");
      setJoinModalOpen(false);
      loadData(); 
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleRequestResponse = async (req: HackathonRequest, newStatus: 'Accepted' | 'Rejected') => {
    const { error: updateError } = await supabase.from('hackathon_requests').update({ status: newStatus }).eq('id', req.id);
    
    if (updateError) {
      alert("Error updating request: " + updateError.message);
      return;
    }

    // Notify applicant
    await supabase.from('notifications').insert([{
      user_id: req.student_id,
      title: `Team Application ${newStatus}`,
      message: `Your request to join ${req.hackathon_teams?.name || 'the team'} was ${newStatus.toLowerCase()}.`,
      type: 'hackathon'
    }]);

    if (newStatus === 'Accepted') {
      const currentSpots = req.hackathon_teams?.spots_open || 0;
      const remainingSpots = Math.max(0, currentSpots - 1);
      const teamStatus = remainingSpots <= 0 ? 'Full' : 'Recruiting';
      
      await supabase.from('hackathon_teams').update({ 
        spots_open: remainingSpots, 
        status: teamStatus 
      }).eq('id', req.team_id);
      
      alert(`Student Accepted! ${remainingSpots} spots remaining.`);
    } else {
      alert("Student Rejected.");
    }
    loadData();
  };

  const handleRemoveMember = async (req: HackathonRequest) => {
    if (!confirm(`Are you sure you want to remove ${req.profiles?.full_name} from the team?`)) return;

    const { error: updateError } = await supabase.from('hackathon_requests').update({ status: 'Rejected' }).eq('id', req.id);
    if (updateError) {
      alert("Error removing member: " + updateError.message);
      return;
    }

    // Notify applicant
    await supabase.from('notifications').insert([{
      user_id: req.student_id,
      title: `Removed from Team`,
      message: `You have been removed from the team ${req.hackathon_teams?.name || 'by the creator'}.`,
      type: 'hackathon'
    }]);

    const currentSpots = req.hackathon_teams?.spots_open || 0;
    const newSpots = currentSpots + 1;
    
    await supabase.from('hackathon_teams').update({ 
      spots_open: newSpots, 
      status: 'Recruiting' 
    }).eq('id', req.team_id);
    
    alert("Member removed.");
    loadData();
  };

  const openApplicantProfile = (applicantData: Profile) => {
    setSelectedApplicant(applicantData);
    setViewProfileModalOpen(true);
  };

  if (userLoading || loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#738a6e] mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading Hackathon Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Hackathon Hub</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#FAF9F6] pb-px overflow-x-auto">
        <button onClick={() => setActiveTab('browse')} className={`pb-4 font-bold text-sm px-2 whitespace-nowrap ${activeTab === 'browse' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}>Browse Teams</button>
        <button onClick={() => setActiveTab('create')} className={`pb-4 font-bold text-sm px-2 whitespace-nowrap ${activeTab === 'create' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}>Create Team</button>
        <button onClick={() => setActiveTab('manage')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'manage' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}>
          Manage Requests {incomingRequests.length > 0 && <span className="bg-red-500 text-[#FAF9F6] text-[10px] px-2 py-0.5 rounded-full">{incomingRequests.length}</span>}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableTeams.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[#FAF9F6] rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">No teams found. Be the first to create one!</p>
            </div>
          ) : (
            availableTeams.map(team => {
              const isMyTeam = team.creator_id === userId;
              const myStatus = myRequestStatus[team.id]; 
              
              return (
                <div key={team.id} className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${isMyTeam ? 'bg-[#FAF9F6]/40 border-emerald-200' : 'bg-[#FAF9F6] border-[#FAF9F6]'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#738a6e] tracking-widest">{team.hackathon_name || 'Hackathon'}</span>
                        <h3 className="font-black text-2xl text-slate-800 leading-tight">{team.name}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${team.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {team.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-500 mb-4 bg-[#FAF9F6] p-3 rounded-lg border border-[#FAF9F6]/50">
                      <p>Spots: <span className="text-slate-800">{team.spots_open} / {team.total_size} Open</span></p>
                      <p>Target Year: <span className="text-slate-800">{team.target_year}</span></p>
                      <p className="col-span-2">Skills Needed: <span className="text-[#738a6e]">{team.required_skills}</span></p>
                    </div>
                    
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-4">
                      <User size={14}/> Leader: {team.profiles?.full_name || 'Student'} ({team.profiles?.branch || 'N/A'})
                    </p>
                  </div>
                  
                  {isMyTeam ? (
                    <div className="mt-6 flex gap-2">
                      <button disabled className="flex-1 bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-xl border border-emerald-200 flex justify-center items-center gap-2 cursor-default">
                        <CheckCircle2 size={16}/> Your Team
                      </button>
                      <button onClick={() => handleDeleteTeam(team.id)} className="px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition flex items-center justify-center" title="Delete Team">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  ) : team.status === 'Full' && myStatus !== 'Accepted' ? (
                     <button disabled className="mt-6 w-full bg-[#FAF9F6]/60 text-slate-400 font-bold py-2.5 rounded-xl cursor-not-allowed flex justify-center items-center gap-2">
                      Team Full
                    </button>
                  ) : myStatus === 'Pending' ? (
                    <button disabled className="mt-6 w-full bg-amber-100 text-amber-700 font-bold py-2.5 rounded-xl border border-amber-200 flex justify-center items-center gap-2 cursor-wait">
                      <Loader2 className="animate-spin" size={16}/> Request Pending
                    </button>
                  ) : myStatus === 'Accepted' ? (
                    <button disabled className="mt-6 w-full bg-[#738a6e] text-[#FAF9F6] font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 cursor-default">
                      <CheckCircle2 size={16}/> Joined Successfully
                    </button>
                  ) : myStatus === 'Rejected' ? (
                    <button disabled className="mt-6 w-full bg-red-50 text-red-600 font-bold py-2.5 rounded-xl border border-red-200 flex justify-center items-center gap-2 cursor-not-allowed">
                      <XCircle size={16}/> Application Rejected
                    </button>
                  ) : (
                    <button onClick={() => { setSelectedTeam(team); setJoinModalOpen(true); }} className="mt-6 w-full bg-[#738a6e] text-[#FAF9F6] font-bold py-2.5 rounded-xl hover:bg-[#94A185] transition flex justify-center items-center gap-2">
                      <Send size={16}/> Apply to Join
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleCreateTeam} className="bg-[#FAF9F6] p-8 rounded-3xl border border-[#FAF9F6] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
           <div className="col-span-2"><h3 className="text-xl font-black text-slate-800 mb-2 border-b pb-4"><PlusCircle className="inline text-[#738a6e] mr-2"/> Build Your Team</h3></div>
           
           <div className="col-span-2 space-y-3 pb-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Team Leader Details</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Name</label>
                 <input disabled value={userProfile?.full_name || ''} className="w-full p-3 bg-[#FAF9F6]/60 border border-[#FAF9F6] rounded-xl text-slate-500 font-medium cursor-not-allowed" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Branch</label>
                 <input disabled value={userProfile?.branch || ''} className="w-full p-3 bg-[#FAF9F6]/60 border border-[#FAF9F6] rounded-xl text-slate-500 font-medium cursor-not-allowed" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Semester</label>
                 <input disabled value={`Semester ${userProfile?.semester || 'N/A'}`} className="w-full p-3 bg-[#FAF9F6]/60 border border-[#FAF9F6] rounded-xl text-slate-500 font-medium cursor-not-allowed" />
               </div>
             </div>
           </div>

           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Hackathon Event Name *</label><input required value={createForm.hackathon_name} onChange={e=>setCreateForm({...createForm, hackathon_name: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Your Team Name *</label><input required value={createForm.team_name} onChange={e=>setCreateForm({...createForm, team_name: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Date *</label><input required type="date" value={createForm.start_date} onChange={e=>setCreateForm({...createForm, start_date: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">End Date *</label><input required type="date" value={createForm.end_date} onChange={e=>setCreateForm({...createForm, end_date: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
           <div className="col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Required Skills *</label><input required value={createForm.required_skills} onChange={e=>setCreateForm({...createForm, required_skills: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
           
           <div className="grid grid-cols-3 gap-4 col-span-2">
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Total Team Size</label><input required type="number" min="2" value={createForm.total_size} onChange={e=>setCreateForm({...createForm, total_size: parseInt(e.target.value)})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Spots Open</label><input required type="number" min="1" value={createForm.spots_open} onChange={e=>setCreateForm({...createForm, spots_open: parseInt(e.target.value)})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Target Year</label>
                <select value={createForm.target_year} onChange={e=>setCreateForm({...createForm, target_year: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl">
                  <option>Any</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
             </div>
           </div>
           
           <button type="submit" className="col-span-2 w-full bg-[#738a6e] text-[#FAF9F6] font-black py-4 rounded-xl hover:bg-[#94A185] mt-4 shadow-lg shadow-emerald-600/20">Publish & Start Recruiting</button>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          {incomingRequests.length === 0 ? (
            <div className="py-12 text-center bg-[#FAF9F6] rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">No pending requests at the moment.</p>
            </div>
          ) : (
            incomingRequests.map(req => (
              <div key={req.id} className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#FAF9F6] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-black text-lg text-slate-800">{req.profiles?.full_name} <span className="text-sm font-normal text-slate-500">applied for</span> {req.hackathon_teams?.name}</h4>
                  <div className="mt-2 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                    <p><b>Email:</b> <a href={`mailto:${req.contact_email}`} className="text-blue-600 hover:underline">{req.contact_email}</a></p>
                    <p><b>Year:</b> {req.year_of_study} ({req.profiles?.branch || 'N/A'})</p>
                    <p><b>Projects Done:</b> {req.project_count}</p>
                    <p><b>Skills:</b> <span className="text-[#738a6e] font-semibold">{req.applicant_skills}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {req.profiles && (
                    <button onClick={() => openApplicantProfile(req.profiles!)} className="px-3 py-2 bg-[#FAF9F6]/60 text-slate-600 hover:bg-slate-200 rounded-xl font-bold flex items-center gap-1" title="View Full Profile"><Eye size={18}/></button>
                  )}
                  {req.status === 'Accepted' ? (
                    <button onClick={() => handleRemoveMember(req)} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-1">Remove Member</button>
                  ) : (
                    <>
                      <button onClick={() => handleRequestResponse(req, 'Rejected')} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold">Reject</button>
                      <button onClick={() => handleRequestResponse(req, 'Accepted')} className="flex-1 md:flex-none px-4 py-2 bg-[#738a6e] text-[#FAF9F6] hover:bg-[#94A185] rounded-xl font-bold">Accept Member</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* JOIN MODAL */}
      {joinModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black mb-4">Apply for {selectedTeam.name}</h3>
            <form onSubmit={submitJoinRequest} className="space-y-4">
              <input required type="email" placeholder="Contact Email" value={joinForm.contact_email} onChange={e=>setJoinForm({...joinForm, contact_email: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" />
              <textarea required placeholder="Your Skills (comma separated)" value={joinForm.skills} onChange={e=>setJoinForm({...joinForm, skills: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Projects Done" value={joinForm.project_count} onChange={e=>setJoinForm({...joinForm, project_count: parseInt(e.target.value)})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" />
                <select value={joinForm.year_of_study} onChange={e=>setJoinForm({...joinForm, year_of_study: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl">
                  <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={()=>setJoinModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-2 bg-[#738a6e] text-[#FAF9F6] font-bold py-3 px-6 rounded-xl">Send Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewProfileModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setViewProfileModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"><XCircle size={24} /></button>
            <h3 className="text-2xl font-black text-slate-800">{selectedApplicant.full_name}</h3>
            <p className="text-sm font-bold text-[#738a6e] uppercase tracking-wider mb-6">{selectedApplicant.branch} • Semester {selectedApplicant.semester || 'N/A'}</p>
            <div className="space-y-4">
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#FAF9F6]/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skills</p>
                <p className="font-semibold">{selectedApplicant.skills || 'No skills listed.'}</p>
              </div>
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#FAF9F6]/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Achievements</p>
                <p className="font-semibold text-sm">{selectedApplicant.achievements || 'None listed.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}