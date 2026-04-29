'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Loader2, Edit2, Save, X, UserCircle } from 'lucide-react';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export default function FacultyProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    id: '', full_name: '', email: '', phone: '', branch: '', role: 'faculty'
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile({
          id: user.id, 
          full_name: data?.full_name || user.user_metadata?.full_name || '', 
          email: data?.email || user.email || '', 
          phone: data?.phone || '', 
          branch: data?.branch || '',
          role: data?.role || 'faculty'
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          branch: profile.branch,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update profile');

      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: unknown) {
      alert('Error updating profile: ' + getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#738a6e]" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Faculty Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your academic contact details.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-[#738a6e] text-[#FAF9F6] font-bold py-2 px-6 rounded-xl hover:bg-[#94A185] transition-colors">
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-[#FAF9F6] rounded-3xl p-8 shadow-sm border border-[#FAF9F6] flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#FAF9F6]/40 rounded-full flex items-center justify-center mb-4">
              <UserCircle size={64} className="text-[#738a6e]" />
            </div>
            <h2 className="font-black text-xl text-slate-800">{profile.full_name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#738a6e] mt-1">Authorized Faculty</p>
            <div className="mt-6 w-full pt-6 border-t border-[#FAF9F6]/50 space-y-3 text-left text-sm font-medium text-slate-500">
               <p>VVCE Staff ID: <span className="text-slate-800 font-bold">F-{(profile.id || '').slice(0, 4).toUpperCase()}</span></p>
               <p>Department: <span className="text-slate-800 font-bold">{profile.branch || 'Academic Dept'}</span></p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="lg:col-span-2 bg-[#FAF9F6] rounded-3xl p-8 shadow-sm border border-[#FAF9F6]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Official Name</label>
              <input required disabled={!isEditing} type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">College Email</label>
              <input required disabled type="email" value={profile.email} className="w-full p-3 bg-[#FAF9F6]/60 border border-[#FAF9F6] rounded-xl opacity-70 cursor-not-allowed" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Phone Number</label>
              <input required disabled={!isEditing} type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70" placeholder="+91..." />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Academic Dept / Branch</label>
              <input disabled={!isEditing} type="text" value={profile.branch} onChange={e => setProfile({...profile, branch: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70" placeholder="e.g. CSE Department" />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex gap-3 border-t border-[#FAF9F6]/50 pt-6">
              <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-[#FAF9F6] border border-[#FAF9F6] text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-[#FAF9F6] transition-colors">
                <X size={16} /> Cancel
              </button>
              <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 bg-[#738a6e] text-[#FAF9F6] font-bold py-3 px-6 rounded-xl hover:bg-[#94A185] transition-colors disabled:opacity-50 flex-1">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Profile
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
