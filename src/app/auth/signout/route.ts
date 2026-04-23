import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Destroy the session on the server
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout Error:', error.message);
  }

  // 2. Revalidate all pages to ensure the UI updates
  revalidatePath('/', 'layout');

  // 3. Redirect securely back to the main landing page
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, {
    status: 303, // See Other - Recommended for POST -> GET redirects
  });
}
