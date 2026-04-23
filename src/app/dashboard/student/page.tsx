import { redirect } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/server';

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // TODO: Later we will fetch the user's role from the profiles table
  // and route them to /faculty or /warden. For now, default to student.
  redirect('/dashboard/student/profile');
}