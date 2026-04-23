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

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: newReq, error: reqErr } = await TutoringService.createRequest(userId, {
      subject: requestForm.subject,
      description: requestForm.description,
      requested_date: requestForm.requested_date || null,
    });

    if (newReq) {
      alert("Tutoring request posted!");
      setRequestForm({ subject: '', description: '', requested_date: '' });
      loadData();
    }
  };

  const handleDeleteRequest = async (reqId: string) => {
    if (!confirm("Delete this request? This will disband the group.")) return;
    const { error } = await TutoringService.deleteRequest(userId, reqId);
    if (!error) { alert("Deleted."); loadData(); }
  };

  const handleJoinGroup = async (req: any) => {
    const { error } = await TutoringService.joinRequest(userId, req.id);
    if (!error) {
      // NOTIFY GROUP LEADER
      await NotificationsService.createNotification(
        req.tutee_id,
        'New Group Member',
        `${userProfile?.full_name} joined your ${req.subject} study group!`,
        'tutoring'
      );
      alert("Joined!");
      loadData();
    }
  };

  const handleAcceptProposal = async (req: any, proposal: any) => {
    const { error } = await TutoringService.acceptProposal(userId, proposal.id);

    if (!error) { 
      // NOTIFY THE TUTOR
      await NotificationsService.createNotification(
        proposal.tutor_id,
        'Proposal Accepted!',
        `Your session for ${req.subject} has been confirmed.`,
        'tutoring'
      );
      
      alert("Tutor confirmed!"); loadData(); 
    }
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await TutoringService.submitProposal(userId, selectedRequest.id, {
      proposed_date: proposeForm.date,
      proposed_time: proposeForm.time,
      venue: proposeForm.venue
    });

    if (!error) {
      // NOTIFY THE GROUP LEADER
      await NotificationsService.createNotification(
        selectedRequest.tutee_id,
        'New Tutor Proposal',
        `${userProfile?.full_name} proposed a time for ${selectedRequest.subject}`,
        'tutoring'
      );
      alert("Proposal sent!"); setProposeModalOpen(false); loadData();
    }
  };

  const openProfile = (profileData: any) => { setSelectedProfile(profileData); setViewProfileModalOpen(true); };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#2E8B57]" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* ... (Header & Tabs remain same) ... */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Peer Tutoring</h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 pb-px">
        <button onClick={() => setActiveTab('learning')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'learning' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400'}`}><BookOpen size={18}/> Learning</button>
        <button onClick={() => setActiveTab('teaching')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'teaching' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400'}`}><GraduationCap size={18}/> Teaching</button>
      </div>

      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><PlusCircle className="text-[#2E8B57]" size={20} /> Request Help</h3>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <input required type="text" value={requestForm.subject} onChange={e=>setRequestForm({...requestForm, subject: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Subject Name..." />
                <input type="date" value={requestForm.requested_date} onChange={e=>setRequestForm({...requestForm, requested_date: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                <textarea required rows={3} value={requestForm.description} onChange={e=>setRequestForm({...requestForm, description: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="What do you need help with?" />
                <button type="submit" className="w-full bg-[#2E8B57] text-white font-black py-4 rounded-xl">Post Request</button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">Join a Group</h3>
              {openRequestsToJoin.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border shadow-sm">
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-1 rounded">{req.subject}</span>
                  <p className="font-semibold text-sm mt-2">"{req.description}"</p>
                  <button onClick={() => handleJoinGroup(req)} className="w-full mt-3 bg-slate-100 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"><HandMetal size={16}/> Join them</button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {myRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-[#2E8B57] bg-emerald-50 px-2 py-1 rounded">{req.subject}</span>
                      {req.tutee_id === userId && <button onClick={() => handleDeleteRequest(req.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>}
                    </div>
                    <p className="font-semibold text-lg mt-2">"{req.description}"</p>
                  </div>
                  <div className="shrink-0">
                    {req.status === 'Pending' ? (
                       <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">Waiting for Tutors</div>
                    ) : req.status === 'Proposed' ? (
                       <div className="bg-blue-50 p-4 rounded-xl">
                         {req.tutoring_proposals?.filter((p:any)=>p.status === 'Pending').map((p:any) => (
                           <div key={p.id} className="flex flex-col gap-2">
                             <p className="text-xs font-bold">{p.tutor.full_name} proposed a time</p>
                             <button onClick={() => handleAcceptProposal(req, p)} className="bg-blue-600 text-white text-xs font-bold py-1.5 rounded-lg">Accept Proposal</button>
                           </div>
                         ))}
                       </div>
                    ) : (
                      <div className="bg-[#2E8B57] text-white p-4 rounded-xl text-sm font-bold">Scheduled @ {req.session_date}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... (Teaching Tab & Modals remain with similar logic updates) ... */}
    </div>
  );
}