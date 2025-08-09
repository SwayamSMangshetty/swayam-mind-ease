/*
  # Add favorite column to journal entries

  1. Changes
    - Add `is_favorite` boolean column to `journal_entries` table
    - Set default value to false
    - Add index for faster favorite filtering

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN is_favorite boolean DEFAULT false;
  END IF;
END $$;

-- Add index for favorite entries
CREATE INDEX IF NOT EXISTS journal_entries_is_favorite_idx ON journal_entries USING btree (is_favorite);