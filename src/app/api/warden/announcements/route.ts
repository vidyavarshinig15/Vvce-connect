import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

function isWardenOrAdmin(role?: string | null, email?: string | null) {
  const emailLower = email?.toLowerCase() || '';
  return role === 'warden' || role === 'admin' || email === 'vvceconnect.official@gmail.com' || emailLower.includes('warden');
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    if (!isWardenOrAdmin(profile?.role, user.email || profile?.email || null)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, hostel_name } = await request.json();

    const { error } = await supabaseAdmin.from('hostel_announcements').insert({
      title,
      content,
      hostel_name,
      warden_id: user.id,
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Announcement created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create announcement' }, { status: 500 });
  }
}
