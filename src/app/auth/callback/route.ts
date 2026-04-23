import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Get URL details. 
  // We use request.url to ensure we get the correct 'localhost:3000' or production domain.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const supabase = await createClient();
      
      // 2. Exchange the temporary code for a permanent session.
      // This sets the Auth cookies in the browser.
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && session?.user) {
        // ENSURE PROFILE EXISTS: After verification, we store the data in Supabase
        const { user } = session;
        const fullName = user.user_metadata?.full_name || 'VVCE User';

        // Using a separate admin client to ensure we can write to profiles regardless of RLS
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Determine Role Based on Email Pattern
        let assignedRole = 'student';
        const emailLower = user.email?.toLowerCase() || '';

        if (emailLower === 'vvceconnect.official@gmail.com') {
          assignedRole = 'admin';
        } else if (emailLower.includes('warden')) {
          assignedRole = 'warden';
        } else {
          const studentRegex = /^vvce\d{2}[a-z0-9]+@vvce\.ac\.in$/;
          if (studentRegex.test(emailLower)) {
            assignedRole = 'student';
          } else if (emailLower.endsWith('@vvce.ac.in')) {
            assignedRole = 'faculty';
          }
        }

        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            email: user.email,
            role: assignedRole,
          }, { onConflict: 'id' });

        // SUCCESS: Send user to the dashboard.
        return NextResponse.redirect(`${requestUrl.origin}${next}`);
      }

      // If Supabase returns an error during exchange
      console.error('Supabase Auth Error:', error?.message || 'Unknown error');
      
    } catch (networkError) {
      // This catches the 'Failed to fetch' if the Supabase URL is still wrong
      console.error('Callback Network Error:', networkError);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=network-connection-failed`);
    }
  }

  // 3. FAILURE: If code is missing or exchange fails, go back to login.
  // We add a query parameter so we can show a message to the user later.
  return NextResponse.redirect(`${requestUrl.origin}/login?error=verification-failed`);
}