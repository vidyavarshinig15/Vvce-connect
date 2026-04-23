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

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data: teams, error: teamsError } = await supabase
        .from('hackathon_teams')
        .select('*')
        .order('created_at', { ascending: false });
      if (teamsError) throw teamsError;

      let hydratedTeams = (teams ?? []) as any[];
      if (hydratedTeams.length > 0) {
        const creatorIds = Array.from(new Set(hydratedTeams.map((team) => team.creator_id).filter(Boolean)));
        if (creatorIds.length > 0) {
          const { data: creators, error: creatorsError } = await supabase
            .from('profiles')
            .select('id, full_name, branch')
            .in('id', creatorIds);
          if (creatorsError) throw creatorsError;

          const creatorMap = new Map((creators ?? []).map((creator: any) => [creator.id, creator]));
          hydratedTeams = hydratedTeams.map((team) => ({
            ...team,
            profiles: creatorMap.get(team.creator_id) || null,
          }));
        }
      }
      setAvailableTeams(hydratedTeams as HackathonTeam[]);

      const { data: myReqs, error: requestsError } = await supabase
        .from('hackathon_requests')
        .select('team_id, status')
        .eq('student_id', userId);
      if (requestsError) throw requestsError;
      if (myReqs) {
        const statusMap: Record<string, string> = {};
        myReqs.forEach(req => {
          statusMap[String(req.team_id)] = String(req.status);
        });
        setMyRequestStatus(statusMap);
      }

      const { data: myOwnedTeams, error: myOwnedTeamsError } = await supabase
        .from('hackathon_teams')
        .select('id')
        .eq('creator_id', userId);
      if (myOwnedTeamsError) throw myOwnedTeamsError;

      if (myOwnedTeams) {
        const teamIds = myOwnedTeams.map(t => String(t.id));
        if (teamIds.length > 0) {
          const { data: incoming, error: incomingError } = await supabase
            .from('hackathon_requests')
            .select('*')
            .in('team_id', teamIds)
            .eq('status', 'Pending');
          if (incomingError) throw incomingError;

          const requestRows = (incoming ?? []) as any[];
          const requesterIds = Array.from(new Set(requestRows.map((row) => row.student_id).filter(Boolean)));

          const { data: requestTeams, error: requestTeamsError } = await supabase
            .from('hackathon_teams')
            .select('id, name, spots_open')
            .in('id', teamIds);
          if (requestTeamsError) throw requestTeamsError;

          let requesterProfiles: any[] = [];
          if (requesterIds.length > 0) {
            const { data: requesterData, error: requesterError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', requesterIds);
            if (requesterError) throw requesterError;
            requesterProfiles = requesterData ?? [];
          }

          const teamMap = new Map((requestTeams ?? []).map((team: any) => [team.id, team]));
          const profileMap = new Map(requesterProfiles.map((profile: any) => [profile.id, profile]));

          const hydratedIncoming = requestRows.map((row) => ({
            ...row,
            hackathon_teams: teamMap.get(row.team_id) || { name: 'Team', spots_open: 0 },
            profiles: profileMap.get(row.student_id) || null,
          }));

          setIncomingRequests(hydratedIncoming as unknown as HackathonRequest[]);
        } else {
          setIncomingRequests([]);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to load hackathon data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => { 
    if (userId) loadData(); 
  }, [userId, loadData]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('hackathon_teams').insert([{ 
      name: createForm.team_name, hackathon_name: createForm.hackathon_name, description: 'N/A', 
      start_date: createForm.start_date, end_date: createForm.end_date, required_skills: createForm.required_skills,
      total_size: createForm.total_size, spots_open: createForm.spots_open, target_year: createForm.target_year,
      creator_id: userId 
    }]);
    
    if (!error) {
      alert("Team Published successfully!");
      setCreateForm({ hackathon_name: '', team_name: '', start_date: '', end_date: '', required_skills: '', target_year: 'Any', total_size: 4, spots_open: 3});
      loadData(); setActiveTab('browse');
    } else alert("Error: " + error.message);
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
      team_id: selectedTeam.id, student_id: userId,
      contact_email: joinForm.contact_email, applicant_skills: joinForm.skills,
      project_count: joinForm.project_count, year_of_study: joinForm.year_of_study
    }]);
    
    if (!error) {
      await supabase.from('notifications').insert([{
        user_id: selectedTeam.creator_id,
        title: 'New Team Request',
        message: `${userProfile?.full_name || 'A student'} wants to join ${selectedTeam.name}`,
        type: 'hackathon'
      }]);

      alert("Application sent to team leader!");
      setJoinModalOpen(false);
      loadData(); 
    } else alert("Error or already requested.");
  };

  const handleRequestResponse = async (req: HackathonRequest, newStatus: 'Accepted' | 'Rejected') => {
    const { error: updateError } = await supabase.from('hackathon_requests').update({ status: newStatus }).eq('id', req.id);
    
    if (updateError) {
      alert("Error updating request: " + updateError.message);
      return;
    }

    await supabase.from('notifications').insert([{
      user_id: req.student_id,
      title: `Team Application ${newStatus}`,
      message: `Your request to join ${req.hackathon_teams.name} was ${newStatus.toLowerCase()}.`,
      type: 'hackathon'
    }]);

    if (newStatus === 'Accepted') {
      const remainingSpots = req.hackathon_teams.spots_open - 1;
      const teamStatus = remainingSpots <= 0 ? 'Full' : 'Recruiting';
      await supabase.from('hackathon_teams').update({ spots_open: remainingSpots, status: teamStatus }).eq('id', req.team_id);
      alert(`Student Accepted! ${remainingSpots} spots remaining.`);
    } else {
      alert("Student Rejected.");
    }
    loadData();
  };

  const openApplicantProfile = (applicantData: Profile) => {
    setSelectedApplicant(applicantData);
    setViewProfileModalOpen(true);
  };

  if (userLoading || loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#2E8B57]" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Hackathon Hub</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 pb-px">
        <button onClick={() => setActiveTab('browse')} className={`pb-4 font-bold text-sm px-2 ${activeTab === 'browse' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}>Browse Teams</button>
        <button onClick={() => setActiveTab('create')} className={`pb-4 font-bold text-sm px-2 ${activeTab === 'create' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}>Create Team</button>
        <button onClick={() => setActiveTab('manage')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'manage' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}>
          Manage Requests {incomingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{incomingRequests.length}</span>}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableTeams.map(team => {
            const isMyTeam = team.creator_id === userId;
            const myStatus = myRequestStatus[team.id]; 
            
            return (
              <div key={team.id} className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${isMyTeam ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#2E8B57] tracking-widest">{team.hackathon_name || 'Hackathon'}</span>
                      <h3 className="font-black text-2xl text-slate-800 leading-tight">{team.name}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${team.status === 'Full' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {team.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p>Spots: <span className="text-slate-800">{team.spots_open} / {team.total_size} Open</span></p>
                    <p>Target Year: <span className="text-slate-800">{team.target_year}</span></p>
                    <p className="col-span-2">Skills Needed: <span className="text-[#2E8B57]">{team.required_skills}</span></p>
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
                   <button disabled className="mt-6 w-full bg-slate-100 text-slate-400 font-bold py-2.5 rounded-xl cursor-not-allowed flex justify-center items-center gap-2">
                    Team Full
                  </button>
                ) : myStatus === 'Pending' ? (
                  <button disabled className="mt-6 w-full bg-amber-100 text-amber-700 font-bold py-2.5 rounded-xl border border-amber-200 flex justify-center items-center gap-2 cursor-wait">
                    <Loader2 className="animate-spin" size={16}/> Request Pending
                  </button>
                ) : myStatus === 'Accepted' ? (
                  <button disabled className="mt-6 w-full bg-[#2E8B57] text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 cursor-default">
                    <CheckCircle2 size={16}/> Joined Successfully
                  </button>
                ) : myStatus === 'Rejected' ? (
                  <button disabled className="mt-6 w-full bg-red-50 text-red-600 font-bold py-2.5 rounded-xl border border-red-200 flex justify-center items-center gap-2 cursor-not-allowed">
                    <XCircle size={16}/> Application Rejected
                  </button>
                ) : (
                  <button onClick={() => { setSelectedTeam(team); setJoinModalOpen(true); }} className="mt-6 w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition flex justify-center items-center gap-2">
                    <Send size={16}/> Apply to Join
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleCreateTeam} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
           <div className="col-span-2"><h3 className="text-xl font-black text-slate-800 mb-2 border-b pb-4"><PlusCircle className="inline text-[#2E8B57] mr-2"/> Build Your Team</h3></div>
           
           <div className="col-span-2 space-y-3 pb-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Team Leader Details</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Name</label>
                 <input disabled value={userProfile?.full_name || ''} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Branch</label>
                 <input disabled value={userProfile?.branch || ''} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Semester</label>
                 <input disabled value={`Semester ${userProfile?.semester || 'N/A'}`} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" />
               </div>
             </div>
           </div>

           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Hackathon Event Name *</label><input required value={createForm.hackathon_name} onChange={e=>setCreateForm({...createForm, hackathon_name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Your Team Name *</label><input required value={createForm.team_name} onChange={e=>setCreateForm({...createForm, team_name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Date *</label><input required type="date" value={createForm.start_date} onChange={e=>setCreateForm({...createForm, start_date: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
           <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">End Date *</label><input required type="date" value={createForm.end_date} onChange={e=>setCreateForm({...createForm, end_date: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
           <div className="col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Required Skills *</label><input required value={createForm.required_skills} onChange={e=>setCreateForm({...createForm, required_skills: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
           
           <div className="grid grid-cols-3 gap-4 col-span-2">
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Total Team Size</label><input required type="number" min="2" value={createForm.total_size} onChange={e=>setCreateForm({...createForm, total_size: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Spots Open</label><input required type="number" min="1" value={createForm.spots_open} onChange={e=>setCreateForm({...createForm, spots_open: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
             <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Target Year</label>
                <select value={createForm.target_year} onChange={e=>setCreateForm({...createForm, target_year: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option>Any</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
             </div>
           </div>
           
           <button type="submit" className="col-span-2 w-full bg-[#2E8B57] text-white font-black py-4 rounded-xl hover:bg-[#257046] mt-4 shadow-lg shadow-emerald-600/20">Publish & Start Recruiting</button>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          {incomingRequests.length === 0 ? <p className="text-slate-500">No pending requests.</p> : incomingRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-black text-lg text-slate-800">{req.profiles?.full_name} <span className="text-sm font-normal text-slate-500">applied for</span> {req.hackathon_teams?.name}</h4>
                <div className="mt-2 text-sm text-slate-600 grid grid-cols-2 gap-x-8 gap-y-1">
                  <p><b>Email:</b> <a href={`mailto:${req.contact_email}`} className="text-blue-600 hover:underline">{req.contact_email}</a></p>
                  <p><b>Year:</b> {req.year_of_study} ({req.profiles?.branch})</p>
                  <p><b>Projects Done:</b> {req.project_count}</p>
                  <p><b>Skills:</b> <span className="text-[#2E8B57] font-semibold">{req.applicant_skills}</span></p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {req.profiles && (
                  <button onClick={() => openApplicantProfile(req.profiles!)} className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold flex items-center gap-1" title="View Full Profile"><Eye size={18}/></button>
                )}
                <button onClick={() => handleRequestResponse(req, 'Rejected')} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold">Reject</button>
                <button onClick={() => handleRequestResponse(req, 'Accepted')} className="flex-1 md:flex-none px-4 py-2 bg-[#2E8B57] text-white hover:bg-[#257046] rounded-xl font-bold">Accept Member</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOIN MODAL */}
      {joinModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black mb-4">Apply for {selectedTeam.name}</h3>
            <form onSubmit={submitJoinRequest} className="space-y-4">
              <input required type="email" placeholder="Contact Email" value={joinForm.contact_email} onChange={e=>setJoinForm({...joinForm, contact_email: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <textarea required placeholder="Your Skills (comma separated)" value={joinForm.skills} onChange={e=>setJoinForm({...joinForm, skills: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Projects Done" value={joinForm.project_count} onChange={e=>setJoinForm({...joinForm, project_count: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                <select value={joinForm.year_of_study} onChange={e=>setJoinForm({...joinForm, year_of_study: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={()=>setJoinModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl">Send Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewProfileModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setViewProfileModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"><XCircle size={24} /></button>
            <h3 className="text-2xl font-black text-slate-800">{selectedApplicant.full_name}</h3>
            <p className="text-sm font-bold text-[#2E8B57] uppercase tracking-wider mb-6">{selectedApplicant.branch} • Semester {selectedApplicant.semester || 'N/A'}</p>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skills</p>
                <p className="font-semibold">{selectedApplicant.skills || 'No skills listed.'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
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
