import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code, GraduationCap, Building, Users } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2E8B57 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-[#2E8B57] uppercase tracking-wider">Campus Digital Gateway</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-8">
            VVCE <span className="text-[#2E8B57]">CONNECT</span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed">
            The unified digital ecosystem for Vidyavardhaka College of Engineering. Streamlining campus life for students, faculty, and administration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={user ? "/dashboard" : "/login"} className="px-8 py-4 bg-[#2E8B57] text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 hover:bg-[#257046] transition-all flex items-center gap-3">
              {user ? "Go to Dashboard" : "Get Started"} <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
              Explore Features
            </Link>
          </div>

          {/* Floating Stats or Badges */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
            {[
              { label: 'Students', value: '4000+' },
              { label: 'Faculty', value: '250+' },
              { label: 'Modules', value: '12+' },
              { label: 'Efficiency', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2E8B57] mb-4">Unified Experience</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Everything your campus needs,<br />in one single platform.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="text-[#2E8B57]" size={28} />}
              title="Hackathon Hub"
              description="Build your dream team or browse specialized skills. Vet applicant profiles and recruit the best talent for upcoming tech events."
            />
            <FeatureCard 
              icon={<BookOpen className="text-[#2E8B57]" size={28} />}
              title="Peer Tutoring"
              description="A collaborative learning platform where students can post help requests or volunteer to tutor others in specific subjects."
            />
            <FeatureCard 
              icon={<Building className="text-[#2E8B57]" size={28} />}
              title="Hostel Portal"
              description="Integrated ecosystem for residents to raise maintenance complaints, track real-time status, and view warden announcements."
            />
            <FeatureCard 
              icon={<GraduationCap className="text-[#2E8B57]" size={28} />}
              title="Venue Booking"
              description="Dedicated faculty tool for reserving M-Block interactive classrooms with automated section calculation and conflict prevention."
            />
            <FeatureCard 
              icon={<Users className="text-[#2E8B57]" size={28} />}
              title="Warden Center"
              description="Complete administrative suite for student directories, real-time room mapping with vacancy tracking, and complaint resolution."
            />
            <FeatureCard 
              icon={<ArrowRight className="text-[#2E8B57]" size={28} />}
              title="System Admin"
              description="Global management panel for authorized personnel to monitor user activity, audit logs, and manage the campus digital gateway."
            />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#2E8B57] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to connect?</h2>
            <p className="text-emerald-100 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto">
              Join thousands of students and faculty members already using the platform.
            </p>
            <Link href={user ? "/dashboard" : "/login"} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#2E8B57] rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl">
              {user ? "Back to Dashboard" : "Log In Now"}
            </Link>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
