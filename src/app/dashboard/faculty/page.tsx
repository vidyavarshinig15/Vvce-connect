'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Calendar, Clock, MapPin, Users, PlusCircle, CheckCircle2, Loader2, Trash2, Search, Filter } from 'lucide-react';

export default function FacultyDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'calendar'
  const [userId, setUserId] = useState('');
  
  // Data States
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  
  // Form State
  const [bookingForm, setBookingForm] = useState({
    room_number: 'Seminar Hall 1',
    booking_date: '',
    start_time: '',
    end_time: '',
    branch: 'CSE',
    academic_year: '3',
    purpose: ''
  });

  // Section Counter Logic (Based on VVCE typical strength)
  const calculateSections = (branch: string, year: string) => {
    if (year === '1' || year === '2') return '4';
    if (branch === 'CSE' || branch === 'ISE') return '3';
    return '2';
  };

  async function loadData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: allData } = await supabase
          .from('classroom_bookings')
          .select('*, profiles(full_name)')
          .order('booking_date', { ascending: true });
        if (allData) {
          setAllBookings(allData);
          setMyBookings(allData.filter(b => b.faculty_id === user.id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const conflict = allBookings.find(b => 
        b.room_number === bookingForm.room_number && 
        b.booking_date === bookingForm.booking_date &&
        ((bookingForm.start_time >= b.start_time && bookingForm.start_time < b.end_time) ||
         (bookingForm.end_time > b.start_time && bookingForm.end_time <= b.end_time))
      );

      if (conflict) {
        alert(`Conflict! Room is already booked by another faculty at this time.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('classroom_bookings').insert([{
        faculty_id: userId,
        room_number: bookingForm.room_number,
        booking_date: bookingForm.booking_date,
        start_time: bookingForm.start_time,
        end_time: bookingForm.end_time,
        branch: bookingForm.branch,
        academic_year: parseInt(bookingForm.academic_year),
        section: calculateSections(bookingForm.branch, bookingForm.academic_year)
      }]);

      if (error) throw new Error(error.message || 'Failed to book room');

      alert("Room Booked Successfully!");
      setBookingForm({ ...bookingForm, purpose: '', booking_date: '', start_time: '', end_time: '' });
      await loadData();
      setActiveTab('calendar');
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('classroom_bookings').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert("Error cancelling booking: " + err.message);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-3xl border border-slate-100 bg-[#FAF9F6] px-8 py-10 shadow-sm">
        <Loader2 className="mx-auto animate-spin text-[#738a6e]" size={40} />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading classroom bookings...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-[#738a6e] shadow-md">
        <div className="px-6 py-8 text-[#FAF9F6] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-[#FAF9F6]">
                Classroom booking
              </span>
              <h1 className="text-3xl font-black tracking-tight text-balance sm:text-4xl text-[#FAF9F6]">
                Faculty Resource Hub
              </h1>
              <p className="max-w-xl text-sm leading-6 text-white/90 sm:text-base">
                Reserve classrooms, avoid conflicts, and review the live schedule in one calm workspace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[280px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Primary action</p>
                <p className="mt-1 font-bold">Create a booking</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Visibility</p>
                <p className="mt-1 font-bold">Shared calendar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('book')}
          className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 transition-all ${activeTab === 'book' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <PlusCircle size={18} /> New Booking
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-4 font-bold text-sm px-2 flex items-center gap-2 transition-all ${activeTab === 'calendar' ? 'text-[#738a6e] border-b-2 border-[#738a6e]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Calendar size={18} /> Master Calendar
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* BOOKING FORM */}
          <form onSubmit={handleBooking} className="space-y-5 rounded-3xl border border-slate-100 bg-[#FAF9F6] p-6 shadow-sm sm:p-8">
            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-800">Reserve a Venue</h3>
              <p className="text-sm text-slate-500">Choose a room, time, and audience before submitting.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Select Venue</label>
                <select value={bookingForm.room_number} onChange={e=>setBookingForm({...bookingForm, room_number: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition focus:border-[#738a6e]">
                  {Array.from({ length: 21 }, (_, i) => 200 + i).map(num => (
                    <option key={`M${num}`} value={`M${num}`}>M{num} (Interactive)</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Date</label>
                <input required type="date" value={bookingForm.booking_date} onChange={e=>setBookingForm({...bookingForm, booking_date: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition focus:border-[#738a6e]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Time</label>
                <input required type="time" value={bookingForm.start_time} onChange={e=>setBookingForm({...bookingForm, start_time: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition focus:border-[#738a6e]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">End Time</label>
                <input required type="time" value={bookingForm.end_time} onChange={e=>setBookingForm({...bookingForm, end_time: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition focus:border-[#738a6e]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Target Branch</label>
                <select value={bookingForm.branch} onChange={e=>setBookingForm({...bookingForm, branch: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition focus:border-[#738a6e]">
                  <option>CSE</option><option>ISE</option><option>AIML</option><option>ECE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Academic Year</label>
                <select value={bookingForm.academic_year} onChange={e=>setBookingForm({...bookingForm, academic_year: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition focus:border-[#738a6e]">
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-[#738a6e]/20 bg-[#FAF9F6] px-4 py-3">
               <p className="flex items-center gap-2 text-xs font-bold text-[#738a6e]">
                 <Users size={14}/> Auto-calculated: {calculateSections(bookingForm.branch, bookingForm.academic_year)} sections to attend
               </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Event Purpose (Optional Notes)</label>
              <input type="text" value={bookingForm.purpose} onChange={e=>setBookingForm({...bookingForm, purpose: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#738a6e]" placeholder="e.g. Guest Lecture on Cloud" />
            </div>

            <button type="submit" className="w-full rounded-xl bg-[#738a6e] py-4 font-black text-[#FAF9F6] shadow-sm transition hover:bg-[#94A185] mt-2">
              Confirm Venue Booking
            </button>
          </form>

          {/* MY RECENT BOOKINGS */}
          <div className="space-y-4">
            <div className="flex items-end justify-between mb-2">
              <h3 className="text-xl font-black text-slate-800">My Bookings</h3>
              <p className="text-xs font-medium text-slate-500">Recent bookings you created</p>
            </div>
            {myBookings.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-slate-200 bg-[#FAF9F6] p-8 text-center text-slate-400">No active bookings.</p>
            ) : myBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#FAF9F6] p-5 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800">{b.branch} Class - {b.academic_year} Year</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <MapPin size={12}/> {b.room_number} | <Clock size={12}/> {b.booking_date} @ {b.start_time?.slice(0,5)}
                  </p>
                </div>
                <button onClick={() => deleteBooking(b.id)} className="rounded-xl p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-[#FAF9F6] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Global Master Schedule</h3>
             <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#738a6e] rounded-full"></div> My Bookings</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full"></div> Colleagues</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBookings.length === 0 ? (
               <p className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-[#FAF9F6] p-12 text-center text-slate-400">The calendar is empty.</p>
            ) : allBookings.map(b => (
              <div key={b.id} className={`rounded-3xl border p-6 shadow-sm transition ${b.faculty_id === userId ? 'border-[#738a6e]/30 bg-[#FAF9F6]' : 'border-slate-100 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${b.faculty_id === userId ? 'bg-[#738a6e] text-[#FAF9F6]' : 'bg-slate-100 text-slate-500'}`}>
                    {b.room_number}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{b.booking_date}</span>
                </div>
                <p className="font-bold text-slate-800 leading-tight text-lg">{b.branch} Class - {b.academic_year} Year</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Section {b.section}</p>
                
                <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reserved By</p>
                    <p className="text-xs font-bold text-[#738a6e]">{b.faculty_id === userId ? 'You' : b.profiles?.full_name}</p>
                  </div>
                  <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <p className="text-xs font-black text-slate-700">{b.start_time.slice(0,5)} - {b.end_time.slice(0,5)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}