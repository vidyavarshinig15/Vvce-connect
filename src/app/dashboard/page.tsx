import { redirect } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/server';

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let role = profile?.role;
  const emailLower = user.email?.toLowerCase() || '';

  // Determine role based on email pattern (takes precedence or acts as fallback)
  if (emailLower === 'vvceconnect.official@gmail.com') {
    role = 'admin';
  } else if (emailLower.includes('warden')) {
    role = 'warden';
  } else if (emailLower.endsWith('@vvce.ac.in')) {
    const studentRegex = /^vvce\d{2}[a-z0-9]+@vvce\.ac\.in$/;
    if (studentRegex.test(emailLower)) {
      role = 'student';
    } else {
      role = 'faculty';
    }
  }

  // Default fallback if still no role
  if (!role) role = 'student';

  // Route based on role
  if (role === 'admin') redirect('/dashboard/admin');
  if (role === 'faculty') redirect('/dashboard/faculty');
  if (role === 'warden') redirect('/dashboard/warden');

  // Default fallback for students
  redirect('/dashboard/student/profile');
}