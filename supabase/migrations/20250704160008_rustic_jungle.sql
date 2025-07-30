/*
  # Create meditation sessions table

  1. New Tables
    - `meditation_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `duration` (integer, session duration in seconds)
      - `type` (text, type of meditation)
      - `completed` (boolean, whether session was completed)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `meditation_sessions` table
    - Add policies for authenticated users to manage their own meditation sessions
*/

CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  duration integer NOT NULL DEFAULT 0 CHECK (duration >= 0),
  type text NOT NULL DEFAULT 'guided' CHECK (type IN ('guided', 'unguided', 'breathing', 'mindfulness', 'body-scan')),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own meditation sessions
CREATE POLICY "Users can read own meditation sessions"
  ON meditation_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own meditation sessions
CREATE POLICY "Users can insert own meditation sessions"
  ON meditation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own meditation sessions
CREATE POLICY "Users can update own meditation sessions"
  ON meditation_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own meditation sessions
CREATE POLICY "Users can delete own meditation sessions"
  ON meditation_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meditation_sessions_user_id_idx ON meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS meditation_sessions_created_at_idx ON meditation_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS meditation_sessions_type_idx ON meditation_sessions(type);
CREATE INDEX IF NOT EXISTS meditation_sessions_completed_idx ON meditation_sessions(completed);