'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { HostelService } from '@/src/services/supabase/hostel.service';
import { NotificationsService } from '@/src/services/supabase/notifications.service';
import { Building, Users, AlertTriangle, Megaphone, Search, Send, MapPin, CheckCircle2, Clock, Loader2, XCircle, FileText, PlusCircle } from 'lucide-react';

export default function WardenDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // directory, map, complaints, announcements
  
  // Data States
  const [allocations, setAllocations] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  // Form States
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', hostel_name: 'Boys Hostel' });
  const [complaintResponse, setComplaintResponse] = useState({ id: '', status: '', response: '' });

  const [admissionForm, setAdmissionForm] = useState({ 
    student_name: '', 
    student_email: '', 
    phone: '',
    usn: '',
    branch: 'CSE',
    hostel_name: 'Boys Hostel', 
    room_number: '',
    sharing_type: '2'
  });

  const [viewProfileModalOpen, setViewProfileModalOpen] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Load Allocations
      const { data: allocData } = await HostelService.getAllocations('');
      if (allocData) setAllocations(allocData);
      
      // Load Complaints
      const { data: compData } = await HostelService.getComplaints('');
      if (compData) setComplaints(compData);

      // Load Announcements
      const { data: annData } = await HostelService.getAnnouncements('');
      if (annData) setAnnouncements(annData);
      
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CAPACITY CHECK
    const occupants = allocations.filter(a => a.hostel_name === admissionForm.hostel_name && a.room_number === admissionForm.room_number);
    const capacity = occupants.length > 0 ? parseInt(occupants[0].sharing_type?.toString() || '2') : parseInt(admissionForm.sharing_type);
    
    if (occupants.length >= capacity) {
      alert(`ERROR: Room ${admissionForm.room_number} is already FULL (${occupants.length}/${capacity}). Please choose another room.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/warden/allocations', {
        method: 'POST',
        body: JSON.stringify({ action: 'insert', allocationData: admissionForm })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Student Admitted Successfully!");
        setAdmissionForm({ 
          student_name: '', student_email: '', phone: '', usn: '', 
          branch: 'CSE', hostel_name: 'Boys Hostel', room_number: '', sharing_type: '2' 
        });
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

  const handleVacate = async (id: string) => {
    if (!confirm("Are you sure you want to remove this student? This will permanently delete the allocation in Supabase.")) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/warden/allocations', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', allocationId: id })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Allocation deleted successfully!");
        await loadData();
      } else {
        alert("Supabase Deletion Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during deletion.");
    } finally {
      setLoading(false);
    }
  };

  const openStudentProfile = async (email: string) => {
    try {
      // First check profiles table
      const { data: profile } = await HostelService.getProfileByEmail(email);
      // Also get their allocation info for USN/Branch fallback
      const { data: allocation } = await HostelService.getAllocationByEmail(email);
      
      if (profile || allocation) {
        setSelectedStudentProfile({
          ...(profile || {}),
          full_name: profile?.full_name || allocation?.student_name,
          email: profile?.email || allocation?.student_email,
          usn: allocation?.usn,
          branch: profile?.branch || allocation?.branch,
          phone: profile?.phone || allocation?.phone
        });
        setViewProfileModalOpen(true);
      } else {
        alert("Profile not found for this student.");
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const filteredAllocations = allocations.filter(a => 
    a.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintResponse.id) return;
    
    const { error } = await HostelService.updateComplaintStatus(currentUserId, complaintResponse.id, complaintResponse.status, complaintResponse.response);

    if (!error) {
      // Find the student to notify
      const complaint = complaints.find(c => c.id === complaintResponse.id);
      if (complaint && complaint.student_email) {
        // Fetch user ID by email to send notification
        const { data: userData } = await HostelService.getProfileByEmail(complaint.student_email);
        if (userData) {
          await NotificationsService.createNotification(
            userData.id,
            `Complaint ${complaintResponse.status}`,
            `Warden Response: ${complaintResponse.response}`,
            'hostel'
          );
        }
      }
      alert("Status updated and student notified!");
      setComplaintResponse({ id: '', status: '', response: '' });
      loadData();
    } else {
      alert("Error: " + (typeof error === 'string' ? error : error.message));
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await HostelService.createAnnouncement(currentUserId, {
      title: announcementForm.title,
      content: announcementForm.content,
      hostel_name: announcementForm.hostel_name
    });

    if (!error) {
      alert("Notice Published to Student Dashboards!");
      setAnnouncementForm({ title: '', content: '', hostel_name: 'Boys Hostel' });
      loadData();
    } else {
      alert("Error: " + (typeof error === 'string' ? error : error.message));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#2E8B57]" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Hostel Admin</h1>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('directory')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'directory' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}><Users size={18}/> Student Directory</button>
        <button onClick={() => setActiveTab('map')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'map' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}><MapPin size={18}/> Room Map</button>
        <button onClick={() => setActiveTab('complaints')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'complaints' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}>
          <AlertTriangle size={18}/> Complaints {complaints.filter(c => c.status === 'Pending').length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{complaints.filter(c => c.status === 'Pending').length}</span>}
        </button>
        <button onClick={() => setActiveTab('announcements')} className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 ${activeTab === 'announcements' ? 'text-[#2E8B57] border-b-2 border-[#2E8B57]' : 'text-slate-400 hover:text-slate-600'}`}><Megaphone size={18}/> Announcements</button>
      </div>

      {/* DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-8">
          {/* ADMISSION FORM */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><PlusCircle className="text-[#2E8B57]"/> Manual Student Admission</h3>
            <form onSubmit={handleAdmission} className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Student Name</label>
                <input required value={admissionForm.student_name} onChange={e => setAdmissionForm({...admissionForm, student_name: e.target.value})} placeholder="Full Name" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Phone Number</label>
                <input required value={admissionForm.phone} onChange={e => setAdmissionForm({...admissionForm, phone: e.target.value})} placeholder="Phone Number" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">USN</label>
                <input required value={admissionForm.usn} onChange={e => setAdmissionForm({...admissionForm, usn: e.target.value})} placeholder="e.g. 4VV21CS001" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email ID</label>
                <input required type="email" value={admissionForm.student_email} onChange={e => setAdmissionForm({...admissionForm, student_email: e.target.value})} placeholder="student@vvce.ac.in" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Branch</label>
                <select value={admissionForm.branch} onChange={e => setAdmissionForm({...admissionForm, branch: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option>CSE</option><option>ISE</option><option>AIML</option><option>ECE</option><option>EEE</option><option>ME</option><option>CV</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Hostel</label>
                <select value={admissionForm.hostel_name} onChange={e => setAdmissionForm({...admissionForm, hostel_name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Inside Campus Girls Hostel">Inside Campus Girls Hostel</option>
                  <option value="Outside Hostel (Girls)">Outside Hostel (Girls)</option>
                </select>
              </div>
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Room No (101-110)</label>
                <input required value={admissionForm.room_number} onChange={e => setAdmissionForm({...admissionForm, room_number: e.target.value})} placeholder="e.g. 101" className="w-full p-3 bg-slate-50 border rounded-xl" />
                {admissionForm.room_number && (
                  <div className="absolute -bottom-5 left-1 flex items-center gap-2">
                    {(() => {
                      const occupants = allocations.filter(a => a.hostel_name === admissionForm.hostel_name && a.room_number === admissionForm.room_number);
                      const capacity = occupants.length > 0 ? parseInt(occupants[0].sharing_type?.toString() || '2') : 2;
                      const isFull = occupants.length >= capacity;
                      return (
                        <>
                          <div className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                            {occupants.length}/{capacity} Filled • {capacity - occupants.length} Vacant Beds
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Sharing Type</label>
                <select value={admissionForm.sharing_type} onChange={e => setAdmissionForm({...admissionForm, sharing_type: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option value="2">2 Sharing</option>
                  <option value="3">3 Sharing</option>
                  <option value="4">4 Sharing</option>
                </select>
              </div>
              <button type="submit" className="md:col-span-4 bg-[#2E8B57] text-white font-black py-4 rounded-xl hover:bg-[#257046] shadow-lg shadow-emerald-600/20">Allocate Room & Admit Student</button>
            </form>
          </div>

          <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3">
            <Search className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name or room number..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full outline-none font-medium text-slate-700 bg-transparent" 
            />
          </div>
          
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Student Name</th>
                  <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Room</th>
                  <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Hostel</th>
                  <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Email</th>
                  <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllocations.map(alloc => (
                  <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{alloc.student_name}</td>
                    <td className="p-4 font-semibold text-[#2E8B57]">Room {alloc.room_number}</td>
                    <td className="p-4 text-sm text-slate-600">{alloc.hostel_name}</td>
                    <td className="p-4 text-sm text-slate-500"><a href={`mailto:${alloc.student_email}`} className="hover:text-[#2E8B57]">{alloc.student_email}</a></td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => openStudentProfile(alloc.student_email)} className="text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm">View Profile</button>
                      <button onClick={() => handleVacate(alloc.id)} className="text-xs font-bold bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg">Vacate</button>
                    </td>
                  </tr>
                ))}
                {filteredAllocations.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No residents found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROOM MAP TAB */}
      {activeTab === 'map' && (
        <div className="space-y-8">
          {/* HOSTEL SELECTOR FOR MAP */}
          <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
            {['Boys Hostel', 'Inside Campus Girls Hostel', 'Outside Hostel (Girls)'].map(h => (
              <button 
                key={h}
                onClick={() => setAnnouncementForm({...announcementForm, hostel_name: h})} // Reusing state or creating new one
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${announcementForm.hostel_name === h ? 'bg-white text-[#2E8B57] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl border shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800">Room Status Loop: {announcementForm.hostel_name}</h3>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> <span className="text-xs font-bold text-slate-500">Full</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div> <span className="text-xs font-bold text-slate-500">Partial</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> <span className="text-xs font-bold text-slate-500">Vacant</span></div>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Array.from({ length: 10 }, (_, i) => 101 + i).map(roomNum => {
                const roomStr = roomNum.toString();
                const occupants = allocations.filter(a => a.hostel_name === announcementForm.hostel_name && a.room_number === roomStr);
                
                // Determine capacity based on first occupant's sharing type or default to 2
                const capacity = occupants.length > 0 ? parseInt(occupants[0].sharing_type?.toString() || '2') : 2;
                const vacancy = capacity - occupants.length;
                
                let statusColor = 'border-emerald-200 bg-emerald-50 text-emerald-700';
                let dotColor = 'bg-emerald-500';
                
                if (occupants.length === capacity) {
                  statusColor = 'border-red-200 bg-red-50 text-red-700';
                  dotColor = 'bg-red-500';
                } else if (occupants.length > 0) {
                  statusColor = 'border-amber-200 bg-amber-50 text-amber-700';
                  dotColor = 'bg-amber-500';
                }

                return (
                  <div key={roomStr} className={`p-5 rounded-[2rem] border shadow-sm flex flex-col items-center transition hover:scale-105 ${statusColor}`}>
                    <div className="flex justify-between w-full mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{capacity} sharing</span>
                      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                    </div>
                    <Building size={32} className="mb-2 opacity-80" />
                    <p className="font-black text-2xl tracking-tighter">{roomStr}</p>
                    <div className="mt-4 w-full space-y-1">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                         <span>Occupied</span>
                         <span>{occupants.length}/{capacity}</span>
                       </div>
                       <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div className={`h-full ${dotColor}`} style={{ width: `${(occupants.length/capacity)*100}%` }}></div>
                       </div>
                       <p className="text-[10px] font-bold text-center mt-2">{vacancy} Vacant Spots</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINTS TAB */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-black text-xl text-slate-800">Student Complaints</h3>
            {complaints.map(comp => (
              <div key={comp.id} className={`p-6 rounded-2xl border shadow-sm cursor-pointer transition ${complaintResponse.id === comp.id ? 'bg-slate-50 border-slate-300 ring-2 ring-[#2E8B57]/20' : 'bg-white border-slate-200 hover:border-slate-300'}`} onClick={() => setComplaintResponse({ id: comp.id, status: comp.status, response: comp.warden_response || '' })}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">{comp.issue_type}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${comp.status === 'Pending' ? 'bg-red-100 text-red-700' : comp.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {comp.status}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 mt-2">"{comp.description}"</p>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1"><Users size={12}/> By: {comp.student_email}</p>
              </div>
            ))}
            {complaints.length === 0 && <p className="text-slate-500">No complaints found.</p>}
          </div>

          <div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-24">
              <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2"><AlertTriangle className="text-[#2E8B57]" size={20}/> Update Status Loop</h3>
              {complaintResponse.id ? (
                <form onSubmit={handleUpdateComplaint} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Set Status</label>
                    <select value={complaintResponse.status} onChange={e => setComplaintResponse({...complaintResponse, status: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-medium">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Text Response (Sent to student)</label>
                    <textarea rows={3} value={complaintResponse.response} onChange={e => setComplaintResponse({...complaintResponse, response: e.target.value})} placeholder="e.g., Maintenance scheduled for tomorrow morning." className="w-full p-3 bg-slate-50 border rounded-xl font-medium" required />
                  </div>
                  <button type="submit" className="w-full bg-[#2E8B57] text-white font-black py-4 rounded-xl hover:bg-[#257046] flex justify-center items-center gap-2">
                    <Send size={18} /> Send Update
                  </button>
                </form>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="mx-auto mb-3 opacity-50" size={40} />
                  <p>Select a complaint to update its status and notify the student.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleCreateAnnouncement} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 sticky top-24">
              <h3 className="font-black text-xl text-slate-800 mb-4 flex items-center gap-2"><Megaphone className="text-[#2E8B57]" size={20}/> Create Notice</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Title</label>
                <input required value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} placeholder="e.g. Water Supply Interruption" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Target Hostel</label>
                <select value={announcementForm.hostel_name} onChange={e => setAnnouncementForm({...announcementForm, hostel_name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Inside Campus Girls Hostel">Inside Campus Girls Hostel</option>
                  <option value="Outside Hostel (Girls)">Outside Hostel (Girls)</option>
                  <option value="All Hostels">All Hostels</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Content</label>
                <textarea required rows={4} value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} placeholder="Detailed notice content..." className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-[#2E8B57] text-white font-black py-4 rounded-xl hover:bg-[#257046] flex justify-center items-center gap-2">
                <Send size={18} /> Publish Notice
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black text-xl text-slate-800 mb-4">Published Notices</h3>
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-lg text-slate-800">{ann.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-slate-100 text-slate-600">{ann.hostel_name}</span>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{ann.content}</p>
                <p className="text-xs text-slate-400 mt-4 flex items-center gap-1"><Clock size={12}/> {new Date(ann.created_at).toLocaleString()}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-slate-500">No announcements yet.</p>}
          </div>
        </div>
      )}
      {/* VIEW PROFILE MODAL */}
      {viewProfileModalOpen && selectedStudentProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setViewProfileModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"><XCircle size={24} /></button>
            <h3 className="text-2xl font-black text-slate-800">{selectedStudentProfile.full_name}</h3>
            <p className="text-sm font-bold text-[#2E8B57] uppercase tracking-wider mb-6">{selectedStudentProfile.branch} • USN: {selectedStudentProfile.usn || 'N/A'}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-semibold text-sm truncate">{selectedStudentProfile.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="font-semibold text-sm">{selectedStudentProfile.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
