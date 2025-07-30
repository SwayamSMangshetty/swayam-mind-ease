/*
  # Update mood entries table to add notes column

  1. Changes to existing tables
    - Add `notes` column to `mood_entries` table for optional descriptions
    - Set default value to empty string for consistency

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add notes column to mood_entries table (it already exists but ensuring it's properly set up)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mood_entries' AND column_name = 'notes'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN notes TEXT DEFAULT '';
  END IF;
END $$;