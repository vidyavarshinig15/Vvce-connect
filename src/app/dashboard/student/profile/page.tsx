'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Loader2, Edit2, Save, X } from 'lucide-react';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialProfile, setInitialProfile] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    id: '', full_name: '', email: '', phone: '', usn: '', branch: '', 
    semester: '', skills: '', achievements: '', resume_link: '', linkedin_url: '', role: 'student'
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
          usn: data?.usn || '',
          branch: data?.branch || '', 
          semester: data?.semester?.toString() || '',
          skills: data?.skills || '', 
          achievements: data?.achievements || '', 
          resume_link: data?.resume_link || '', 
          linkedin_url: data?.linkedin_url || '', 
          role: data?.role || 'student'
        });
        setInitialProfile(data || null);
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
          usn: profile.usn,
          branch: profile.branch,
          semester: profile.semester ? parseInt(profile.semester) : null,
          skills: profile.skills,
          achievements: profile.achievements,
          linkedin_url: profile.linkedin_url,
          resume_link: profile.resume_link,
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
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your mandatory academic details.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-[#738a6e] text-[#FAF9F6] font-bold py-2 px-6 rounded-xl hover:bg-[#94A185] transition-colors">
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>
      
      <form onSubmit={handleSave} className="bg-[#FAF9F6] rounded-3xl p-8 shadow-sm border border-[#FAF9F6]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Full Name *</label>
            <input required disabled={!isEditing || !!initialProfile?.full_name} type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">College Email *</label>
            <input required disabled type="email" value={profile.email} className="w-full p-3 bg-[#FAF9F6]/60 border border-[#FAF9F6] rounded-xl opacity-70 cursor-not-allowed" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">USN *</label>
            <input required disabled={!isEditing || !!initialProfile?.usn} type="text" value={profile.usn} onChange={e => setProfile({...profile, usn: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. 4VV22CS..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Branch *</label>
            <select required disabled={!isEditing || !!initialProfile?.branch} value={profile.branch} onChange={e => setProfile({...profile, branch: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed">
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="AIML">AIML</option>
              <option value="ISE">ISE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="CV">CV</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Semester *</label>
            <input required disabled={!isEditing || !!initialProfile?.semester} type="number" min="1" max="8" value={profile.semester} onChange={e => setProfile({...profile, semester: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. 5" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Phone Number *</label>
            <input required disabled={!isEditing || !!initialProfile?.phone} type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="+91..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">LinkedIn Profile URL *</label>
            <input required disabled={!isEditing} pattern="https://(www\.)?linkedin\.com/.*" title="Must be a valid LinkedIn URL (e.g., https://linkedin.com/in/...)" type="url" value={profile.linkedin_url} onChange={e => setProfile({...profile, linkedin_url: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="https://linkedin.com/in/..." />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Technical Skills *</label>
            <input required disabled={!isEditing} type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="React, Python, Figma..." />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Key Achievements (Optional)</label>
            <textarea disabled={!isEditing} rows={3} value={profile.achievements} onChange={e => setProfile({...profile, achievements: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed resize-none" placeholder="Won SIH 2023, Built 3 apps..." />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Resume / Drive Link (Optional)</label>
            <input disabled={!isEditing} pattern="https://drive\.google\.com/.*" title="Must be a valid Google Drive URL (e.g., https://drive.google.com/...)" type="url" value={profile.resume_link} onChange={e => setProfile({...profile, resume_link: e.target.value})} className="w-full p-3 bg-[#FAF9F6] border border-[#FAF9F6] rounded-xl outline-none focus:border-[#738a6e] disabled:opacity-70 disabled:cursor-not-allowed" placeholder="https://drive.google.com/..." />
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
  );
}
