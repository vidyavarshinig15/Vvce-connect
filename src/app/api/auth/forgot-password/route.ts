import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Instant Validation (No DB call)
    if (!email?.endsWith('@vvce.ac.in')) {
      return NextResponse.json({ error: "Invalid VVCE Email" }, { status: 400 });
    }

    // 2. Fast User Check (Indexed Lookup)
    const { data: user, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (searchError || !user) {
      return NextResponse.json({ error: "No user exists with this email ID" }, { status: 404 });
    }

    // 3. FIRE AND FORGET (The Speed Secret)
    // We do NOT 'await' this. We let it run in the background.
    supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/callback?next=/reset-password`,
    });

    // 4. Return response immediately
    return NextResponse.json(
      { message: "Link sent! Check your inbox." },
      { status: 200 }
    );

  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Server Busy" }, { status: 500 });
  }
}
