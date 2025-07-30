/*
  # Disable RLS for Development

  This migration temporarily disables Row Level Security (RLS) on all tables
  to allow development and testing before authentication is implemented.
  
  ## Changes Made:
  1. Disable RLS on all user-related tables
  2. This allows unrestricted access for development
  3. RLS should be re-enabled when authentication is implemented
  
  ## Tables Affected:
  - profiles
  - journal_entries  
  - mood_entries
  - chat_messages
  - meditation_sessions
  - meditation_guides
  
  ## Important Notes:
  - This is for development only
  - Re-enable RLS when auth is implemented
  - Current policies will remain but be inactive
*/

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_guides DISABLE ROW LEVEL SECURITY;