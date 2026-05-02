import { redirect } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const emailLower = user.email.toLowerCase();
  
  // 1. Strict Rules Engine
  let expectedRole: string | null = null;
  
  if (emailLower === 'vvceconnect.official@gmail.com') {
    expectedRole = 'admin';
  } else if (emailLower === 'warden@vvce.ac.in') {
    expectedRole = 'warden';
  } else if (emailLower.endsWith('@vvce.ac.in')) {
    // Regex: vvce + 2 digits + branch characters + 4 digits + @vvce.ac.in
    const studentRegex = /^vvce\d{2}[a-z]+\d{4}@vvce\.ac\.in$/;
    if (studentRegex.test(emailLower)) {
      expectedRole = 'student';
    } else {
      expectedRole = 'faculty'; // Any other @vvce.ac.in email is a faculty
    }
  }

  // If the email doesn't match any rules (e.g. random @gmail.com), throw them out
  if (!expectedRole) {
    redirect('/login?error=unauthorized_domain');
  }

  // 2. Database Sync - If the database is wrong (e.g. from a default trigger), FIX IT!
  if (!profile || profile.role !== expectedRole) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    await supabaseAdmin
      .from('profiles')
      .update({ role: expectedRole })
      .eq('id', user.id);
  }

  // 3. Route based on the strictly determined role
  if (expectedRole === 'admin') redirect('/dashboard/admin');
  if (expectedRole === 'faculty') redirect('/dashboard/faculty');
  if (expectedRole === 'warden') redirect('/dashboard/warden');

  // Default fallback for students
  redirect('/dashboard/student/profile');
}