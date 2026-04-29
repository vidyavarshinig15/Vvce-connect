'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ value, onChange, label = "Password" }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label?: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2 relative">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full p-4 bg-[#FAF9F6]/60/50 border border-[#FAF9F6] rounded-2xl outline-none focus:border-[#738a6e] text-sm pr-12"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#738a6e]"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}