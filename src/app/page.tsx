import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code, GraduationCap } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col w-full bg-[#FAF9F6] min-h-screen font-sans">
      
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center">
        <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter text-slate-900 leading-[0.95] max-w-5xl mx-auto mb-6">
          Intelligent Campus Ecosystem.<br />
          <span className="text-[#738a6e]">Reliable Connectivity.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          The high-clarity digital toolkit for Vidyavardhaka College of Engineering. 
          Stop guessing, start streamlining your campus life.
        </p>

        <Link 
          href={user ? "/dashboard" : "/login"} 
          className="bg-[#738a6e] text-[#FAF9F6] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#94A185] transition-colors shadow-lg"
        >
          {user ? "Go to Dashboard" : "Get Started"}
        </Link>
        <p className="text-xs text-slate-400 font-medium italic mt-4">
          Available for all VVCE students and faculty
        </p>
      </section>

      {/* HOW IT WORKS HEADER */}
      <section id="features" className="pt-16 pb-12 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
          Features
        </h2>
        <p className="text-[#94A185] font-black text-sm md:text-base uppercase tracking-widest">
          Step-by-step execution for every module in our platform
        </p>
      </section>

      {/* FEATURES CARDS SECTION */}
      <section className="pb-32 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CARD 1 */}
        <div className="bg-[#FAF9F6] border-2 border-[#FAF9F6]/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col h-full">
          <div className="w-12 h-12 bg-[#FAF9F6]/50 rounded-2xl flex items-center justify-center mb-6 text-[#738a6e]">
            <Code size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Hackathon Hub</h3>
          
          <div className="relative pl-10 space-y-8 flex-1">
            <div className="absolute left-[15px] top-2 bottom-8 w-px border-l-2 border-dashed border-[#FAF9F6]"></div>
            
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">01</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Profile Setup</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Students configure their technical skills and past achievements.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">02</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Team Creation</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Founders create teams and specify the exact roles required.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">03</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Recruitment</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Applicants browse open positions and submit requests to join.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">04</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Final Roster</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Team is finalized and ready for the upcoming technical event.</p>
            </div>
          </div>
          
          <div className="mt-8 bg-[#FAF9F6]/30 text-[#738a6e] text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center border border-[#FAF9F6]/50">
            ✦ FULL ACCESS: SMART MATCHING
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-[#FAF9F6] border-2 border-[#FAF9F6]/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col h-full">
          <div className="w-12 h-12 bg-[#FAF9F6]/50 rounded-2xl flex items-center justify-center mb-6 text-[#738a6e]">
            <BookOpen size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Peer Tutoring</h3>
          
          <div className="relative pl-10 space-y-8 flex-1">
            <div className="absolute left-[15px] top-2 bottom-8 w-px border-l-2 border-dashed border-[#FAF9F6]"></div>
            
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">01</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Request Help</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Student posts a detailed request for a specific academic subject.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">02</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Volunteer Matching</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Available tutors browse the board and submit teaching proposals.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">03</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Session Scheduling</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Tutor proposes a specific date, time, and online or physical venue.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">04</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Confirmation</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Student accepts the proposal and the tutoring session is locked in.</p>
            </div>
          </div>
          
          <div className="mt-8 bg-[#FAF9F6]/30 text-[#738a6e] text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center border border-[#FAF9F6]/50">
            ✦ FULL ACCESS: LIVE SCHEDULING
          </div>
        </div>

        {/* CARD 3 */}
        <div className="bg-[#FAF9F6] border-2 border-[#FAF9F6]/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col h-full">
          <div className="w-12 h-12 bg-[#FAF9F6]/50 rounded-2xl flex items-center justify-center mb-6 text-[#738a6e]">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Venue Booking</h3>
          
          <div className="relative pl-10 space-y-8 flex-1">
            <div className="absolute left-[15px] top-2 bottom-8 w-px border-l-2 border-dashed border-[#FAF9F6]"></div>
            
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">01</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Availability Check</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Faculty queries availability for M-Block interactive classrooms.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">02</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Section Allocation</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">System instantly calculates required sections based on enrollment.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">03</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Conflict Prevention</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Automatically flags and blocks any overlapping schedule attempts.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full border-2 border-[#94A185] bg-[#FAF9F6] flex items-center justify-center text-[#94A185] text-xs font-black">04</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Final Booking</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Venue is officially reserved and visible on the global calendar.</p>
            </div>
          </div>
          
          <div className="mt-8 bg-[#FAF9F6]/30 text-[#738a6e] text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center border border-[#FAF9F6]/50">
            ✦ FULL ACCESS: CONFLICT RESOLUTION
          </div>
        </div>

      </section>

      {/* FOOTER SECTION */}
      <footer id="contact" className="bg-[#0B1121] text-slate-300 py-16 px-6 border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="text-white text-xl font-black mb-4">VVCE Connect</h3>
            <p className="text-sm font-medium leading-relaxed opacity-80">
              A unified digital ecosystem to help you connect your campus faster and maintain a flawless student experience.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-3 text-sm font-medium opacity-80">
              <li><Link href="#features" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
              
            </ul>
          </div>
          
          
          
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm font-medium opacity-80">
              <li><a href="mailto:info@vvce.ac.in" className="hover:text-white transition">info@vvce.ac.in</a></li>
              <li><a href="tel:0000000000" className="hover:text-white transition">Ph no:0000000000</a></li>
              <li className="pt-2">
                <span className="font-bold text-white block mb-1">Address:</span>
                Vidyavardhaka College of Engineering<br/>
                P.B. No.206, Gokulam III Stage,<br/>
                Mysuru - 570 002
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-70">© 2026 VVCE Connect - All rights reserved</p>
          <div className="flex items-center gap-3">
            
          </div>
        </div>
      </footer>

    </div>
  );
}
