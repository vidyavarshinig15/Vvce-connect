import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

function isWardenOrAdmin(role?: string | null, email?: string | null) {
  const emailLower = email?.toLowerCase() || '';
  return role === 'warden' || role === 'admin' || email === 'vvceconnect.official@gmail.com' || emailLower.includes('warden');
}

export async function GET(request: Request) {
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

    const email = new URL(request.url).searchParams.get('email');

    if (email) {
      const { data: profileRow, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: allocationRow, error: allocationError } = await supabaseAdmin
        .from('hostel_allocations')
        .select('*')
        .eq('student_email', email)
        .maybeSingle();

      if (allocationError) throw allocationError;

      return NextResponse.json({
        profile: profileRow,
        allocation: allocationRow,
      });
    }

    const [allocationsRes, complaintsRes, announcementsRes] = await Promise.all([
      supabaseAdmin.from('hostel_allocations').select('*').order('room_number', { ascending: true }),
      supabaseAdmin.from('hostel_complaints').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('hostel_announcements').select('*').order('created_at', { ascending: false }),
    ]);

    if (allocationsRes.error) throw allocationsRes.error;
    if (complaintsRes.error) throw complaintsRes.error;
    if (announcementsRes.error) throw announcementsRes.error;

    return NextResponse.json({
      allocations: allocationsRes.data ?? [],
      complaints: complaintsRes.data ?? [],
      announcements: announcementsRes.data ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load warden dashboard' }, { status: 500 });
  }
}
