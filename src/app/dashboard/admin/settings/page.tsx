'use client';
import { useState } from 'react';
import { Settings, Shield, Bell, Database, Lock, Save, Loader2, Globe } from 'lucide-react';

export default function SystemSettings() {
  const [saving, setSaving] = useState(false);
  const [config, setProfileConfig] = useState({
    academicYear: '2025 - 2026',
    semester: 'Even Semester',
    restrictEmail: true,
    allowExternal: true,
    mfaFaculty: false,
    autoEmail: true,
    notifyWarden: true
  });

  const handleSave = () => {
    setSaving(true);
    // Simulating a real API call to persist settings
    setTimeout(() => {
      setSaving(false);
      alert("System configuration updated and saved to database!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium">Configure global platform parameters and security policies.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* PLATFORM CONFIG */}
        <SettingsSection 
          icon={<Globe size={20} className="text-blue-500" />} 
          title="Platform Configuration" 
          desc="General settings for the VVCE Connect portal."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase">Academic Year</label>
               <select 
                 value={config.academicYear} 
                 onChange={e => setProfileConfig({...config, academicYear: e.target.value})}
                 className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-xl font-bold text-sm outline-none focus:border-[#738a6e]"
               >
                 <option>2025 - 2026</option>
                 <option>2026 - 2027</option>
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase">Current Semester</label>
               <select 
                 value={config.semester} 
                 onChange={e => setProfileConfig({...config, semester: e.target.value})}
                 className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6]/50 rounded-xl font-bold text-sm outline-none focus:border-[#738a6e]"
               >
                 <option>Even Semester</option>
                 <option>Odd Semester</option>
               </select>
             </div>
          </div>
        </SettingsSection>

        {/* SECURITY */}
        <SettingsSection 
          icon={<Shield size={20} className="text-red-500" />} 
          title="Security & Access" 
          desc="Manage domain restrictions and authentication rules."
        >
          <div className="space-y-4">
            <Toggle 
              label="Restrict to @vvce.ac.in emails" 
              active={config.restrictEmail} 
              onToggle={() => setProfileConfig({...config, restrictEmail: !config.restrictEmail})}
            />
            <Toggle 
              label="Allow external Gmail for testing" 
              active={config.allowExternal} 
              onToggle={() => setProfileConfig({...config, allowExternal: !config.allowExternal})}
            />
            <Toggle 
              label="Enable MFA for Faculty" 
              active={config.mfaFaculty} 
              onToggle={() => setProfileConfig({...config, mfaFaculty: !config.mfaFaculty})}
            />
          </div>
        </SettingsSection>

        {/* NOTIFICATIONS */}
        <SettingsSection 
          icon={<Bell size={20} className="text-amber-500" />} 
          title="Global Notifications" 
          desc="Email and push notification templates."
        >
          <div className="space-y-4">
            <Toggle 
              label="Send auto-email on admission" 
              active={config.autoEmail} 
              onToggle={() => setProfileConfig({...config, autoEmail: !config.autoEmail})}
            />
            <Toggle 
              label="Notify warden on new complaint" 
              active={config.notifyWarden} 
              onToggle={() => setProfileConfig({...config, notifyWarden: !config.notifyWarden})}
            />
          </div>
        </SettingsSection>

        <div className="flex justify-end pt-6">
           <button onClick={handleSave} className="flex items-center gap-2 bg-[#738a6e] text-[#FAF9F6] font-black py-4 px-10 rounded-2xl shadow-lg hover:bg-[#94A185] transition-all">
             {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
             Save Configuration
           </button>
        </div>

      </div>
    </div>
  );
}

function SettingsSection({ icon, title, desc, children }: any) {
  return (
    <div className="bg-[#FAF9F6] rounded-[2rem] border border-[#FAF9F6] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-50 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#FAF9F6] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-black text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, active, onToggle }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <div 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-[#738a6e]' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-[#FAF9F6] rounded-full transition-all ${active ? 'left-7' : 'left-1'}`}></div>
      </div>
    </div>
  );
}
