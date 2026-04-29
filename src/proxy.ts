import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  // 1. Refresh the user's session and get their Auth status
  const { supabaseResponse, user } = await updateSession(request);

  const currentPath = request.nextUrl.pathname;

  // 2. DEFINE SECURITY RULES
  const isProtectedRoute = currentPath.startsWith('/dashboard');
  const isAuthRoute = currentPath === '/login' || currentPath === '/signup';

  // 3. ENFORCE RULES
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', currentPath); 
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url)); 
  }

  // 4. If all checks pass, allow them through
  if (isProtectedRoute) {
    supabaseResponse.headers.set('x-middleware-cache', 'no-cache');
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  }

  return supabaseResponse;
}

// 5. OPTIMIZATION
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};