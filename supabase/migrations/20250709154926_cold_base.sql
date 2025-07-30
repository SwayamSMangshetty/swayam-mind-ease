/*
  # Update journal entries table to add mood column

  1. Changes to existing tables
    - Add `mood` column to `journal_entries` table with CHECK constraint
    - Set default value to 'neutral' for consistency
    - Update existing entries to have a default mood value

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add mood column to journal_entries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'mood'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN mood TEXT DEFAULT 'neutral';
  END IF;
END $$;

-- Add CHECK constraint for mood values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'journal_entries_mood_check'
  ) THEN
    ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_mood_check 
    CHECK (mood IN ('happy', 'sad', 'neutral', 'angry'));
  END IF;
END $$;

-- Create index for mood filtering
CREATE INDEX IF NOT EXISTS journal_entries_mood_idx ON journal_entries(mood);