/*
  # Temporarily disable foreign key constraints for development
  
  This migration temporarily disables foreign key constraints to allow the application 
  to work with temporary user IDs during development, before authentication is implemented.
  
  1. Remove foreign key constraints from all tables
  2. Insert temporary user profile for development
  3. Add note about re-enabling constraints when auth is implemented
*/

-- Remove foreign key constraint from profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Remove foreign key constraint from mood_entries table
ALTER TABLE mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_id_fkey;

-- Remove foreign key constraint from journal_entries table
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;

-- Remove foreign key constraint from chat_messages table
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

-- Remove foreign key constraint from meditation_sessions table
ALTER TABLE meditation_sessions DROP CONSTRAINT IF EXISTS meditation_sessions_user_id_fkey;

-- Insert temporary user profile for development
INSERT INTO profiles (id, name, email, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Development User',
  'dev@example.com',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Note: When implementing authentication, you'll need to:
-- 1. Re-add the foreign key constraints
-- 2. Remove this temporary profile
-- 3. Enable RLS policies