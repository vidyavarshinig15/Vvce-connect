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
    room_name: 'Seminar Hall 1',
    booking_date: '',
    start_time: '',
    end_time: '',
    branch: 'CSE',
    academic_year: '3rd Year',
    purpose: ''
  });

  // Section Counter Logic (Based on VVCE typical strength)
  const calculateSections = (branch: string, year: string) => {
    // Basic logic: 1st/2nd years usually have more sections
    if (year === '1st Year' || year === '2nd Year') return 4;
    if (branch === 'CSE' || branch === 'ISE') return 3;
    return 2;
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      
      // 1. Fetch ALL bookings for the Master Calendar
      const { data: allData } = await supabase
        .from('room_bookings')
        .select('*, profiles(full_name)')
        .order('booking_date', { ascending: true });
      if (allData) {
        setAllBookings(allData);
        setMyBookings(allData.filter(b => b.faculty_id === user.id));
      }
    }
    setLoading(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Double Booking Check (Frontend check before DB)
    const conflict = allBookings.find(b => 
      b.room_name === bookingForm.room_name && 
      b.booking_date === bookingForm.booking_date &&
      ((bookingForm.start_time >= b.start_time && bookingForm.start_time < b.end_time) ||
       (bookingForm.end_time > b.start_time && bookingForm.end_time <= b.end_time))
    );

    if (conflict) {
      alert(`Conflict! Room is already booked by another faculty at this time.`);
      return;
    }

    const { error } = await supabase.from('room_bookings').insert([{
      faculty_id: userId,
      room_name: bookingForm.room_name,
      booking_date: bookingForm.booking_date,
      start_time: bookingForm.start_time,
      end_time: bookingForm.end_time,
      branch: bookingForm.branch,
      academic_year: bookingForm.academic_year,
      sections: calculateSections(bookingForm.branch, bookingForm.academic_year),
      purpose: bookingForm.purpose
    }]);

    if (!error) {
      alert("Room Booked Successfully!");
      setBookingForm({ ...bookingForm, purpose: '', booking_date: '', start_time: '', end_time: '' });
      loadData();
      setActiveTab('calendar');
    } else {
      alert("Error: " + error.message);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from('room_bookings').delete().eq('id', id);
    if (!error) loadData();
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-3xl border border-slate-200 bg-white/90 px-8 py-10 shadow-sm">
        <Loader2 className="mx-auto animate-spin text-[#2E8B57]" size={40} />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading classroom bookings...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="bg-gradient-to-r from-[#2E8B57] via-emerald-600 to-teal-600 px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-50">
                Classroom booking
              </span>
              <h1 className="text-3xl font-black tracking-tight text-balance sm:text-4xl">
                Faculty Resource Hub
              </h1>
              <p className="max-w-xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                Reserve classrooms, avoid conflicts, and review the live schedule in one calm workspace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[280px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-50/70">Primary action</p>
                <p className="mt-1 font-bold">Create a booking</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-50/70">Visibility</p>
                <p className="mt-1 font-bold">Shared calendar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('book')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-[#2E8B57] text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <PlusCircle size={18} /> New Booking
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-[#2E8B57] text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Calendar size={18} /> Master Calendar
          </button>
        </div>
      </div>

      {activeTab === 'book' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* BOOKING FORM */}
          <form onSubmit={handleBooking} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Reserve a Venue</h3>
              <p className="text-sm text-slate-500">Choose a room, time, and audience before submitting.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Select Venue</label>
                <select value={bookingForm.room_name} onChange={e=>setBookingForm({...bookingForm, room_name: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition focus:border-[#2E8B57] focus:bg-white">
                  {Array.from({ length: 21 }, (_, i) => 200 + i).map(num => (
                    <option key={`M${num}`} value={`M${num}`}>M{num} (Interactive)</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Date</label>
                <input required type="date" value={bookingForm.booking_date} onChange={e=>setBookingForm({...bookingForm, booking_date: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition focus:border-[#2E8B57] focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Time</label>
                <input required type="time" value={bookingForm.start_time} onChange={e=>setBookingForm({...bookingForm, start_time: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition focus:border-[#2E8B57] focus:bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">End Time</label>
                <input required type="time" value={bookingForm.end_time} onChange={e=>setBookingForm({...bookingForm, end_time: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition focus:border-[#2E8B57] focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Target Branch</label>
                <select value={bookingForm.branch} onChange={e=>setBookingForm({...bookingForm, branch: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition focus:border-[#2E8B57] focus:bg-white">
                  <option>CSE</option><option>ISE</option><option>AIML</option><option>ECE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Academic Year</label>
                <select value={bookingForm.academic_year} onChange={e=>setBookingForm({...bookingForm, academic_year: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition focus:border-[#2E8B57] focus:bg-white">
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
               <p className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                 <Users size={14}/> Auto-calculated: {calculateSections(bookingForm.branch, bookingForm.academic_year)} sections to attend
               </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Event Purpose</label>
              <input required type="text" value={bookingForm.purpose} onChange={e=>setBookingForm({...bookingForm, purpose: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2E8B57] focus:bg-white" placeholder="e.g. Guest Lecture on Cloud" />
            </div>

            <button type="submit" className="w-full rounded-2xl bg-[#2E8B57] py-4 font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#257046]">
              Confirm Venue Booking
            </button>
          </form>

          {/* MY RECENT BOOKINGS */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <h3 className="text-lg font-black text-slate-800">My Bookings</h3>
              <p className="text-xs font-medium text-slate-500">Recent bookings you created</p>
            </div>
            {myBookings.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-400">No active bookings.</p>
            ) : myBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800">{b.purpose}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <MapPin size={12}/> {b.room_name} | <Clock size={12}/> {b.booking_date} @ {b.start_time.slice(0,5)}
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
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Global Master Schedule</h3>
             <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#2E8B57] rounded-full"></div> My Bookings</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full"></div> Colleagues</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBookings.length === 0 ? (
               <p className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center text-slate-400">The calendar is empty.</p>
            ) : allBookings.map(b => (
              <div key={b.id} className={`rounded-3xl border p-5 shadow-sm transition ${b.faculty_id === userId ? 'border-emerald-200 bg-emerald-50/80' : 'border-slate-200 bg-white/90'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${b.faculty_id === userId ? 'bg-[#2E8B57] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {b.room_name}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{b.booking_date}</span>
                </div>
                <p className="font-bold text-slate-800 leading-tight">{b.purpose}</p>
                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reserved By</p>
                    <p className="text-xs font-bold text-[#2E8B57]">{b.faculty_id === userId ? 'You' : b.profiles?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800">{b.start_time.slice(0,5)} - {b.end_time.slice(0,5)}</p>
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