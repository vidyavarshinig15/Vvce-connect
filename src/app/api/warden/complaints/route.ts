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

    const { complaintId, status, response } = await request.json();

    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('hostel_complaints')
      .select('id, student_id, student_email, hostel_name')
      .eq('id', complaintId)
      .maybeSingle();

    if (complaintError) throw complaintError;
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('hostel_complaints')
      .update({
        status,
        warden_response: response,
        responded_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', complaintId);

    if (updateError) throw updateError;

    const targetUserId = complaint.student_id;

    if (targetUserId) {
      await supabaseAdmin.from('notifications').insert({
        user_id: targetUserId,
        title: `Complaint ${status}`,
        message: `Warden Response: ${response}`,
        type: 'hostel',
        is_read: false,
      });
    }

    return NextResponse.json({ message: 'Complaint updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update complaint' }, { status: 500 });
  }
}
