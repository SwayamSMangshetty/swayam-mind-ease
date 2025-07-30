/*
  # Remove unique constraint on profiles.email column

  1. Changes
    - Remove unique constraint on profiles.email column
    - Keep email index for performance but make it non-unique
    - This allows the handle_new_user trigger to work properly without conflicts

  2. Why this fix works
    - auth.users already enforces email uniqueness for authentication
    - profiles.id (primary key) ensures one profile per user
    - Removing redundant email uniqueness prevents trigger failures
*/

-- Drop the unique constraint on email
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Drop the existing unique index
DROP INDEX IF EXISTS profiles_email_idx;

-- Recreate as a non-unique index for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles USING btree (email);