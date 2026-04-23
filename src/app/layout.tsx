import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/src/utils/supabase/server";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VVCE Connect | Unified Campus Portal",
  description: "Official Digital Gateway for Vidyavardhaka College of Engineering",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${spaceGrotesk.className} antialiased text-slate-900 flex flex-col min-h-screen m-0 p-0`}>
        
        {/* GLOBAL HEADER */}
        <nav className="fixed top-0 w-full bg-[#2E8B57] border-b border-white/10 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="bg-white p-2 rounded-2xl shadow-xl group-hover:scale-105 transition-transform">
                <Image src="/vvce-logo.png" alt="VVCE Logo" width={48} height={48} priority />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">
                VVCE <span className="text-emerald-100">CONNECT</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6 text-xs font-black text-emerald-50">
                <Link href="/#features" className="hover:text-white transition-colors uppercase tracking-widest">Features</Link>
                <a href="https://vvce.ac.in" target="_blank" className="hover:text-white transition-colors uppercase tracking-widest">Official Website</a>
                <Link href="/contact" className="hover:text-white transition-colors uppercase tracking-widest">Contact Us</Link>
              </div>
              
              {user ? (
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="text-xs font-black text-white bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-all uppercase tracking-widest">
                    Dashboard
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="text-xs font-black text-emerald-100 hover:text-white transition-colors uppercase tracking-widest">
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="bg-white text-[#2E8B57] hover:bg-emerald-50 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-xl uppercase tracking-widest">
                  Sign In / Login
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-grow pt-20 flex flex-col w-full relative">
          {children}
        </main>

        {/* ULTRA-THIN FOOTER */}
        <footer className="w-full bg-[#2E8B57] py-3 border-t border-white/10 text-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Vidyavardhaka College of Engineering, Mysuru
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-100 opacity-60">
              © {new Date().getFullYear()} VVCE Connect Portal
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
