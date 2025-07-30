/*
  # Create mood entries table

  1. New Tables
    - `mood_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `mood` (text, mood value)
      - `notes` (text, optional notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `mood_entries` table
    - Add policies for authenticated users to manage their own mood entries
*/

CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood text NOT NULL CHECK (mood IN ('happy', 'sad', 'neutral', 'angry', 'overwhelmed', 'excited', 'anxious', 'calm')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own mood entries
CREATE POLICY "Users can read own mood entries"
  ON mood_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own mood entries
CREATE POLICY "Users can insert own mood entries"
  ON mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own mood entries
CREATE POLICY "Users can update own mood entries"
  ON mood_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own mood entries
CREATE POLICY "Users can delete own mood entries"
  ON mood_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mood_entries_user_id_idx ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_entries_created_at_idx ON mood_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS mood_entries_mood_idx ON mood_entries(mood);