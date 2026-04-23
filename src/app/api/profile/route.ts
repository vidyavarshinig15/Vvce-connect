import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

type ProfileUpdatePayload = {
  full_name?: string;
  phone?: string;
  branch?: string;
  semester?: number | null;
  skills?: string;
  achievements?: string;
  linkedin_url?: string;
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

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
