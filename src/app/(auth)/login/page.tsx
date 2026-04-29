'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      // Successful login - Redirect to dashboard which handles role-based routing
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase m-0">Log In</h1>
            <p className="text-xs font-bold text-[#738a6e] uppercase tracking-widest mt-2 m-0">Portal Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="college email ID" 
                className="w-full p-4 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-2xl outline-none focus:border-[#738a6e] transition font-medium text-slate-800" 
              />
            </div>

            <div className="space-y-1 relative text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
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
              <div className="text-right mt-1">
                <Link href="/forgot-password" title="Forgot Password?" className="text-xs font-bold text-[#738a6e] uppercase tracking-tighter hover:underline">Forgot Password?</Link>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold uppercase tracking-widest text-center text-red-500">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              className="w-full bg-[#738a6e] text-[#FAF9F6] font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-[#94A185] transition-all transform active:scale-[0.98] mt-4 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Entering...</span>
                </>
              ) : (
                'Enter Portal'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#FAF9F6]/50 pt-6">
            <p className="text-xs font-bold text-slate-500 m-0">
              New Student? <Link href="/signup" className="text-[#738a6e] hover:underline font-black uppercase">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
