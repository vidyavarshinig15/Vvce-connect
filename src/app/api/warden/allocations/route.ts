import { NextResponse } from 'next/server';
import { HostelService } from '@/src/services/supabase/hostel.service';
import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user is Warden or Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'warden' && profile?.role !== 'admin' && user.email !== 'vvceconnect.official@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, allocationData, allocationId } = await request.json();

    if (action === 'insert') {
      const { error } = await HostelService.createAllocation(user.id, allocationData);
      if (error) throw error;
      return NextResponse.json({ message: 'Allocation successful' });
    }

    if (action === 'delete') {
      const { error } = await HostelService.deleteAllocation(user.id, allocationId);
      if (error) throw error;
      return NextResponse.json({ message: 'Vacated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
