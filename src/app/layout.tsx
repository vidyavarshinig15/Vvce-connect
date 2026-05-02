import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/src/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VVCE Connect | Unified Campus Portal",
  description: "Official Digital Gateway for Vidyavardhaka College of Engineering",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} antialiased text-slate-900 flex flex-col min-h-screen m-0 p-0`}>
        
        {/* GLOBAL HEADER */}
        <nav className="fixed top-0 w-full bg-[#FAF9F6] border-b border-[#FAF9F6] z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="group-hover:scale-105 transition-transform">
                <Image src="/vvce-logo.png" alt="VVCE Logo" width={48} height={48} priority />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900">
                VVCE <span className="text-[#738a6e]">CONNECT</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6 text-xs font-black text-slate-500">
                <Link href="/#features" className="hover:text-[#738a6e] transition-colors uppercase tracking-widest">Features</Link>
                <a href="https://vvce.ac.in" target="_blank" className="hover:text-[#738a6e] transition-colors uppercase tracking-widest">Official Website</a>
                <Link href="/#contact" className="hover:text-[#738a6e] transition-colors uppercase tracking-widest">Contact Us</Link>
              </div>
              
              {user ? (
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="text-xs font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest">
                    Dashboard
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="text-xs font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest">
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="bg-[#738a6e] text-[#FAF9F6] hover:bg-[#3d4c30] px-6 py-3 rounded-xl text-xs font-black transition-all shadow-xl uppercase tracking-widest">
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

      </body>
    </html>
  );
}
