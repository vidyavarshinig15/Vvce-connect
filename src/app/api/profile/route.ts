import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

type ProfileUpdatePayload = {
  full_name?: string;
  phone?: string;
  branch?: string;
  semester?: number | null;
  usn?: string;
  skills?: string;
  achievements?: string;
  linkedin_url?: string;
  resume_link?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Profile update route accessed by user:', user.id);

    const body = (await request.json()) as ProfileUpdatePayload;

    const updates: ProfileUpdatePayload = {
      full_name: body.full_name,
      phone: body.phone ?? '',
      branch: body.branch ?? '',
      semester: typeof body.semester === 'number' ? body.semester : null,
      skills: body.skills ?? '',
      achievements: body.achievements ?? '',
      linkedin_url: body.linkedin_url ?? '',
    };
    // USN is intentionally omitted from the 'profiles' updates because it does not exist in that table.
    // It will be synced exclusively to 'hostel_allocations' below.

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Profile Update DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // SYNC WITH WARDEN DASHBOARD (hostel_allocations)
    if (user.email) {
      const allocationUpdates: any = {};
      if (body.full_name) allocationUpdates.student_name = body.full_name;
      if (body.phone !== undefined) allocationUpdates.phone = body.phone;
      if (body.branch !== undefined) allocationUpdates.branch = body.branch;
      if (body.usn !== undefined) allocationUpdates.usn = body.usn;

      if (Object.keys(allocationUpdates).length > 0) {
        const { error: allocError } = await supabaseAdmin
          .from('hostel_allocations')
          .update(allocationUpdates)
          .eq('student_email', user.email);

        if (allocError) {
          console.error('Failed to sync profile updates to hostel_allocations:', allocError);
          // We don't throw here to avoid failing the user profile update just because they aren't in a hostel
        }
      }
    }

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Profile Update Catch Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
