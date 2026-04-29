'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/src/utils/supabase/client';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An error occurred during registration.';
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // 1. SIGN UP WITH SUPABASE
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setStatus({
          type: 'success',
          msg: 'Registration successful! Please check your email to verify your account.'
        });
        // Optional: clear form
        setFullName('');
        setEmail('');
        setPassword('');
      }

    } catch (err: unknown) {
      setStatus({ type: 'error', msg: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-grow flex items-center justify-center overflow-hidden min-h-[calc(100vh-112px)] w-full m-0 p-0">
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/campus.jpg" 
          alt="VVCE Campus" 
          fill 
          className="object-cover brightness-[0.35]"
          priority
        />
      </div>

      {/* REGISTER CARD */}
      <div className="relative z-10 w-full max-w-md px-6 py-10">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase m-0">Register</h1>
            <p className="text-xs font-bold text-[#738a6e] uppercase tracking-widest mt-2 m-0">Create Student Account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name" 
                className="w-full p-4 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-2xl outline-none focus:border-[#738a6e] transition font-medium text-slate-800" 
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">College Email ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="name@vvce.ac.in" 
                className="w-full p-4 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-2xl outline-none focus:border-[#738a6e] transition font-medium text-slate-800" 
              />
            </div>

            <div className="space-y-1 relative text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Create Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-4 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-2xl outline-none focus:border-[#738a6e] transition font-medium text-slate-800" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {status && (
              <p className={`text-xs font-bold uppercase tracking-widest text-center ${status.type === 'error' ? 'text-red-500' : 'text-[#738a6e]'}`}>
                {status.msg}
              </p>
            )}

            <button 
              disabled={loading}
              className="w-full bg-[#738a6e] text-[#FAF9F6] font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-[#94A185] transition-all transform active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#FAF9F6]/50 pt-6">
            <p className="text-xs font-bold text-slate-500 m-0">
              Already have an account? <Link href="/login" className="text-[#738a6e] hover:underline font-black uppercase">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
