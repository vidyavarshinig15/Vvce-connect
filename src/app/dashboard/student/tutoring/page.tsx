'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { ProfileService } from '@/src/services/supabase/profile.service';
import { TutoringService } from '@/src/services/supabase/tutoring.service';
import { NotificationsService } from '@/src/services/supabase/notifications.service';
import { BookOpen, GraduationCap, PlusCircle, Clock, CheckCircle2, Loader2, CalendarDays, MessageCircle, Users, MapPin, HandMetal, Eye, XCircle, ExternalLink, Trash2 } from 'lucide-react';

export default function TutoringDashboard() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('learning'); 
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [myRequests, setMyRequests] = useState<any[]>([]); 
  const [openRequestsToJoin, setOpenRequestsToJoin] = useState<any[]>([]); 
  const [volunteerBoard, setVolunteerBoard] = useState<any[]>([]); 
  const [myTeachings, setMyTeachings] = useState<any[]>([]); 
  
  const [requestForm, setRequestForm] = useState({ subject: '', description: '', requested_date: '' });
  
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [proposeForm, setProposeForm] = useState({ date: '', time: '', venue: '' });

  const [viewProfileModalOpen, setViewProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUserId(user.id);
      const { data: profile } = await ProfileService.getCurrentProfile(user.id);
      if (profile) setUserProfile(profile);
      
      try {
        const { data: myParts } = await TutoringService.getMyParticipantRequestIds(user.id);
        const myReqIds = myParts?.map(p => p.request_id) || [];
        const safeIds = myReqIds.length > 0 ? myReqIds.join(',') : '00000000-0000-0000-0000-000000000000';
        
        const { data: myReqs } = await TutoringService.getMyRequests(user.id, myReqIds);
        
        if (myReqs) setMyRequests(myReqs);

        const { data: allPending } = await TutoringService.getOpenRequests(user.id);

        if (allPending) {
          setOpenRequestsToJoin(allPending);
          setVolunteerBoard(allPending);
        }

        const { data: myTutorings } = await TutoringService.getMyTeachings(user.id);
        if (myTutorings) setMyTeachings(myTutorings);

      } catch (err) { console.error(err); }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: newReq, error: reqErr } = await TutoringService.createRequest(userId, {
        subject: requestForm.subject,
        description: requestForm.description,
        requested_date: requestForm.requested_date || null,
      });

      if (reqErr) throw new Error(reqErr.message || 'Failed to post request');
      if (newReq) {
        alert("Tutoring request posted!");
        setRequestForm({ subject: '', description: '', requested_date: '' });
        await loadData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (reqId: string) => {
    if (!confirm("Delete this request? This will disband the group.")) return;
    setLoading(true);
    try {
      const { error } = await TutoringService.deleteRequest(userId, reqId);
      if (error) throw new Error(error.message || 'Failed to delete');
      alert("Deleted."); 
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const handleJoinGroup = async (req: any) => {
    setLoading(true);
    try {
      const { error } = await TutoringService.joinRequest(userId, req.id);
      if (error) throw new Error(error.message || error.toString() || 'Failed to join group');
      
      // NOTIFY GROUP LEADER
      await NotificationsService.createNotification(
        req.tutee_id,
        'New Group Member',
        `${userProfile?.full_name} joined your ${req.subject} study group!`,
        'tutoring'
      );
      alert("Joined!");
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (req: any, proposal: any) => {
    setLoading(true);
    try {
      const { error } = await TutoringService.acceptProposal(userId, proposal.id);
      if (error) throw new Error(error.message || error.toString() || 'Failed to accept proposal');
      
      // NOTIFY THE TUTOR
      await NotificationsService.createNotification(
        proposal.tutor_id,
        'Proposal Accepted!',
        `Your session for ${req.subject} has been confirmed.`,
        'tutoring'
      );
      
      alert("Tutor confirmed!"); 
      await loadData(); 
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await TutoringService.submitProposal(userId, selectedRequest.id, {
        proposed_date: proposeForm.date,
        proposed_time: proposeForm.time,
        venue: proposeForm.venue
      });
      if (error) throw new Error(error.message || 'Failed to submit proposal');

      // NOTIFY THE GROUP LEADER
      await NotificationsService.createNotification(
        selectedRequest.tutee_id,
        'New Tutor Proposal',
        `${userProfile?.full_name} proposed a time for ${selectedRequest.subject}`,
        'tutoring'
      );
      alert("Proposal sent!"); 
      setProposeModalOpen(false); 
      await loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const openProfile = (profileData: any) => { setSelectedProfile(profileData); setViewProfileModalOpen(true); };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#738a6e]" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* ... (Header & Tabs remain same) ... */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Peer Tutoring</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#FAF9F6] pb-px">
        <button onClick={() => setActiveTab('learning')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'learning' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400'}`}><BookOpen size={18}/> Learning</button>
        <button onClick={() => setActiveTab('teaching')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'teaching' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400'}`}><GraduationCap size={18}/> Teaching</button>
      </div>

      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#FAF9F6] p-6 rounded-3xl border shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><PlusCircle className="text-[#738a6e]" size={20} /> Request Help</h3>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <input required type="text" value={requestForm.subject} onChange={e=>setRequestForm({...requestForm, subject: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" placeholder="Subject Name..." />
                <input type="date" value={requestForm.requested_date} onChange={e=>setRequestForm({...requestForm, requested_date: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" />
                <textarea required rows={3} value={requestForm.description} onChange={e=>setRequestForm({...requestForm, description: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" placeholder="What do you need help with?" />
                <button type="submit" className="w-full bg-[#738a6e] text-[#FAF9F6] font-black py-4 rounded-xl">Post Request</button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">Join a Group</h3>
              {openRequestsToJoin.map(req => (
                <div key={req.id} className="bg-[#FAF9F6] p-4 rounded-2xl border shadow-sm">
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-1 rounded">{req.subject}</span>
                  <p className="font-semibold text-sm mt-2">"{req.description}"</p>
                  
                  <div className="mt-3 flex flex-col gap-1">
                    <p className="text-xs text-slate-500 font-semibold">{req.tutoring_participants?.length || 0} People asking for help:</p>
                    <div className="flex flex-wrap gap-1">
                      {req.tutoring_participants?.map((p: any) => (
                        <span key={p.student_id} className="text-[10px] bg-[#FAF9F6]/60 text-slate-600 px-2 py-0.5 rounded-full">{p.profiles?.full_name}</span>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => handleJoinGroup(req)} className="w-full mt-3 bg-[#FAF9F6]/60 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"><HandMetal size={16}/> Join them</button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {myRequests.map(req => (
              <div key={req.id} className="bg-[#FAF9F6] p-6 rounded-3xl border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-[#738a6e] bg-[#FAF9F6]/40 px-2 py-1 rounded">{req.subject}</span>
                      {req.tutee_id === userId && <button onClick={() => handleDeleteRequest(req.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>}
                    </div>
                    <p className="font-semibold text-lg mt-2">"{req.description}"</p>
                    
                    <div className="mt-4 flex flex-col gap-2">
                      <p className="text-xs text-slate-500 font-semibold">{req.tutoring_participants?.length || 0} People in group:</p>
                      <div className="flex flex-wrap gap-2">
                        {req.tutoring_participants?.map((p: any) => (
                          <span key={p.student_id} className="text-xs bg-[#FAF9F6]/60 text-slate-600 px-3 py-1 rounded-full font-medium">{p.profiles?.full_name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {req.tutoring_proposals?.some((p:any) => p.status === 'Pending') || req.status === 'Proposed' ? (
                       <div className="bg-blue-50 p-4 rounded-xl">
                         {req.tutoring_proposals?.filter((p:any)=>p.status === 'Pending').map((p:any) => (
                           <div key={p.id} className="flex flex-col gap-2">
                             <p className="text-xs font-bold">{p.tutor.full_name} proposed a time</p>
                             <button onClick={() => handleAcceptProposal(req, p)} className="bg-blue-600 text-[#FAF9F6] text-xs font-bold py-1.5 rounded-lg px-3">Accept Proposal</button>
                           </div>
                         ))}
                       </div>
                    ) : req.status === 'Pending' ? (
                       <div className="text-xs font-bold text-slate-400 bg-[#FAF9F6] px-4 py-2 rounded-xl">Waiting for Tutors</div>
                    ) : (
                      <div className="bg-[#738a6e] text-[#FAF9F6] p-4 rounded-xl text-sm font-bold">Scheduled @ {req.session_date}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'teaching' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><GraduationCap className="text-[#738a6e]" size={24} /> Become a Tutor</h3>
            <p className="text-sm text-slate-500">Help your peers by volunteering to teach subjects you excel in.</p>
            {volunteerBoard.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-3xl text-center text-slate-500">
                No open requests available right now.
              </div>
            ) : (
              volunteerBoard.map(req => (
                <div key={req.id} className="bg-[#FAF9F6] p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#738a6e] bg-[#FAF9F6]/40 px-2 py-1 rounded">{req.subject}</span>
                    <p className="font-semibold text-lg mt-3">"{req.description}"</p>
                    <div className="mt-4 flex flex-col gap-2">
                      <p className="text-xs text-slate-500 font-semibold">{req.tutoring_participants?.length || 0} People asking for help:</p>
                      <div className="flex flex-wrap gap-2">
                        {req.tutoring_participants?.map((p: any) => (
                          <span key={p.student_id} className="text-xs bg-[#FAF9F6]/60 text-slate-600 px-3 py-1 rounded-full font-medium">{p.profiles?.full_name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedRequest(req); setProposeModalOpen(true); }} className="mt-6 w-full bg-[#738a6e] hover:bg-[#94A185] text-[#FAF9F6] font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <CalendarDays size={18} /> Propose Session Time
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800">My Tutoring Sessions</h3>
            {myTeachings.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-3xl text-center text-slate-500">
                You haven't accepted any tutoring requests yet.
              </div>
            ) : (
              myTeachings.map(req => (
                <div key={req.id} className="bg-[#FAF9F6] p-6 rounded-3xl border border-[#738a6e]/30 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-[#738a6e] bg-[#FAF9F6]/40 px-2 py-1 rounded">{req.subject}</span>
                  <p className="font-semibold text-lg mt-3">"{req.description}"</p>
                  
                  <div className="mt-4 p-4 bg-[#FAF9F6] rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} /> <span className="font-bold">Date:</span> {req.session_date || 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} /> <span className="font-bold">Group Size:</span> {req.tutoring_participants?.length || 0}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {req.tutoring_participants?.map((p: any) => (
                        <span key={p.student_id} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-md">{p.profiles?.full_name}</span>
                      ))}
                    </div>
                  </div>

                  {req.status === 'Proposed' && (
                    <div className="mt-4 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-center">
                      Waiting for students to accept your proposal...
                    </div>
                  )}
                  {req.status === 'Scheduled' && (
                    <div className="mt-4 text-sm font-bold text-[#738a6e] bg-[#FAF9F6]/40 px-4 py-2 rounded-xl text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Session Scheduled
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PROPOSE MODAL */}
      {proposeModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-slate-800">Propose Session</h3>
              <button onClick={() => setProposeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <div className="mb-6 p-4 bg-[#FAF9F6] rounded-xl">
              <span className="text-xs font-bold text-[#738a6e] uppercase">{selectedRequest.subject}</span>
              <p className="text-sm font-semibold mt-1">"{selectedRequest.description}"</p>
            </div>

            <form onSubmit={submitProposal} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Proposed Date</label>
                <input required type="date" value={proposeForm.date} onChange={e=>setProposeForm({...proposeForm, date: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Proposed Time</label>
                <input required type="time" value={proposeForm.time} onChange={e=>setProposeForm({...proposeForm, time: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Venue (Online Link or Room)</label>
                <input required type="text" value={proposeForm.venue} onChange={e=>setProposeForm({...proposeForm, venue: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border rounded-xl" placeholder="e.g. Google Meet link or Room 204" />
              </div>
              
              <button type="submit" disabled={loading} className="w-full mt-4 bg-[#738a6e] hover:bg-[#94A185] text-[#FAF9F6] font-black py-4 rounded-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Proposal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewProfileModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setViewProfileModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            <div className="text-center mt-4">
              <div className="w-20 h-20 bg-[#738a6e] text-[#FAF9F6] rounded-full flex items-center justify-center text-3xl font-black mx-auto shadow-lg">
                {selectedProfile.full_name?.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mt-4">{selectedProfile.full_name}</h3>
              <p className="text-sm font-bold text-[#738a6e] mt-1">{selectedProfile.branch} • Sem {selectedProfile.semester}</p>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Skills</p>
                <p className="text-sm font-semibold">{selectedProfile.skills || 'Not specified'}</p>
              </div>
              {selectedProfile.linkedin_url && (
                <a href={selectedProfile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  <ExternalLink size={18} /> View LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}