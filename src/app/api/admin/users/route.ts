import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // STRICT SECURITY CHECK
    if (!user || user.email !== 'vvceconnect.official@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, userData, userId, email } = await request.json();

    if (action === 'update') {
      const { error } = await supabaseAdmin.from('profiles').update(userData).eq('id', userId);
      if (error) throw error;

      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'PROFILE_UPDATED',
        table_name: 'profiles',
        record_id: userId,
      });

      return NextResponse.json({ message: 'User updated successfully' });
    }

    if (action === 'delete') {
      // 1. Clear allocations
      await supabaseAdmin.from('hostel_allocations').delete().eq('student_email', email);
      // 2. Delete profile
      const { error } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'USER_DELETED',
        table_name: 'profiles',
        record_id: userId,
      });

      return NextResponse.json({ message: 'User deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
