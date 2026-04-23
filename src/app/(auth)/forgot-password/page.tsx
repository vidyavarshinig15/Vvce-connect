'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: data.message || "Verification link sent! Check your inbox." });
      } else {
        setStatus({ type: 'error', msg: data.error || "Something went wrong." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: "Connection error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-grow flex items-center justify-center overflow-hidden min-h-[calc(100vh-112px)] w-full m-0 p-0">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/campus.jpg" 
          alt="VVCE Campus" 
          fill 
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase m-0">Reset Access</h1>
            <p className="text-[10px] font-black text-[#2E8B57] uppercase tracking-[0.3em] mt-2 m-0">Verify College Email</p>
          </div>

          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">College Email ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="Enter college email ID" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#2E8B57] transition font-medium" 
              />
            </div>

            {status && (
              <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${status.type === 'error' ? 'text-red-500' : 'text-[#2E8B57]'}`}>
                {status.msg}
              </p>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-[#2E8B57] hover:bg-[#257046] text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform active:scale-[0.98] uppercase tracking-widest text-[11px] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-[10px] font-black text-[#2E8B57] uppercase tracking-widest hover:underline underline-offset-4">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
