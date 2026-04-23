'use client';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support Ticket Created! Our campus team will contact you shortly.");
  };

  return (
    <div className="flex-grow bg-white flex flex-col">
      {/* SECTION: BANNER */}
      <section className="bg-emerald-50 py-16 px-6 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="bg-white text-[#2E8B57] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">
              Campus Support
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-6 tracking-tighter">
              Get in <span className="text-[#2E8B57]">Touch</span>
            </h1>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto font-medium">
              Experiencing technical issues or need help with campus modules? Reach out to the admin desk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION: INFO & FORM */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Info Side */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#2E8B57] p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/10">
              <MessageSquare size={32} className="mb-6 opacity-40" />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Help Desk</h3>
              <p className="text-xs font-medium text-emerald-100/80 leading-relaxed">
                Our support team is available Monday to Saturday to assist with technical issues.
              </p>
            </div>

            <div className="space-y-6 px-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#2E8B57]"><Mail size={18}/></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</p><p className="font-bold text-slate-700">support@vvce.ac.in</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#2E8B57]"><Phone size={18}/></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</p><p className="font-bold text-slate-700">+91 0000000000</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#2E8B57]"><MapPin size={18}/></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p><p className="font-bold text-slate-700">Vidyavardhaka College of Engineering<br></br>P.B. No.206, Kannada Sahithya Parishath Rd, III Stage, Gokulam, Mysuru, Karnataka 570017</p></div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-8 md:p-10 rounded-[3rem] shadow-sm space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Your Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#2E8B57] transition font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email ID</label>
                    <input required type="email" placeholder="name@vvce.ac.in" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#2E8B57] transition font-medium" />
                  </div>
               </div>
               
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Department / Query Type</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#2E8B57] transition font-bold text-slate-700">
                    <option>Technical Issue (App Bug)</option>
                    <option>Hostel Management</option>
                    <option>Faculty Resources</option>
                    <option>Other Inquiry</option>
                  </select>
               </div>

               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Message</label>
                <textarea required rows={5} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#2E8B57] transition font-medium text-slate-800" placeholder="Describe your issue..."></textarea>
               </div>
               
               <button type="submit" className="w-full bg-[#2E8B57] text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-[#257046] transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                Submit Query <Send size={20}/>
               </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}