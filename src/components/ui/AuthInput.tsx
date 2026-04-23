'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

export default function AuthInput({ label, type, value, onChange, placeholder }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2 relative w-full">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full p-4 bg-slate-100/50 border border-slate-200 rounded-2xl outline-none focus:border-[#2E8B57] transition-all text-sm text-slate-900 placeholder:text-slate-400 ${isPassword ? 'pr-12' : 'pr-4'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-slate-400 hover:text-[#2E8B57] transition-colors p-1 z-10"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
          </button>
        )}
      </div>
    </div>
  );
}