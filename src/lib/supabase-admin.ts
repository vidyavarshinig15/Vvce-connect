import { createClient } from '@supabase/supabase-js';

// 1. Ensure variables exist to prevent silent failures during build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase Admin client initialized without URL or Service Role Key. Ensure .env.local is configured.');
}

// 2. Initialize the Admin Client ("God Mode")
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // Critical for Server-Side clients: Prevents memory leaks and session conflicts
    autoRefreshToken: false,
    persistSession: false,
  },
});