'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (password.length < 6) {
      setStatus({ type: 'error', msg: "Password must be at least 6 characters." });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus({ type: 'error', msg: error.message });
        setLoading(false);
      } else {
        setStatus({ type: 'success', msg: "Password updated successfully! Redirecting..." });
        setTimeout(() => {
          router.push('/login?message=Password updated successfully');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: "Connection error. Please try again." });
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

      {/* Reset Password Card */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase m-0">New Password</h1>
            <p className="text-[10px] font-black text-[#738a6e] uppercase tracking-[0.3em] mt-2 m-0">Secure your VVCE account</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-1 relative text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">New Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-2xl outline-none focus:border-[#738a6e] transition font-medium" 
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
              <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${status.type === 'error' ? 'text-red-500' : 'text-[#738a6e]'}`}>
                {status.msg}
              </p>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-[#738a6e] hover:bg-[#94A185] text-[#FAF9F6] font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform active:scale-[0.98] uppercase tracking-widest text-[11px] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
