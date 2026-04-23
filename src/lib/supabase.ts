import { createBrowserClient } from '@supabase/ssr'

/**
 * PRODUCTION-GRADE SUPABASE BROWSER CLIENT
 * This client is used for Client Components and Hooks (useAuth, etc.)
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validation: Catch missing env variables before the SDK crashes the app
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'CRITICAL ERROR: Supabase environment variables are missing! ' +
      'Check your .env.local file and ensure the server has been restarted.'
    )
    // Throwing a descriptive error helps in debugging during development
    throw new Error('Missing Supabase Environment Variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}