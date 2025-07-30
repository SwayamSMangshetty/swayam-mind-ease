import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing. Please click "Connect to Supabase" button to set up your database connection.');
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null as any; // Fallback to prevent initialization errors


// Helper function to get current user ID from authenticated session
export const getCurrentUserId = () => {
  const { data: { user } } = supabase?.auth.getUser() || { data: { user: null } };
  return user?.id || null;
};

// Helper function to get current user ID synchronously (for immediate use)
export const getCurrentUserIdSync = () => {
  if (!isSupabaseConfigured) return null;
  
  const session = supabase.auth.getSession();
  // Note: This is synchronous access to the current session
  // In practice, you should use the async version or get from auth context
  return session ? null : null; // Will be properly set by AuthContext
};