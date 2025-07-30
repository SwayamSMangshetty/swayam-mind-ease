/*
  # Create meditation guides table

  1. New Tables
    - `meditation_guides`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `duration` (text, not null) 
      - `description` (text, optional)
      - `image_url` (text, for meditation guide images)
      - `audio_url` (text, for meditation audio files)
      - `available_offline` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `meditation_guides` table
    - Add policy for public read access (meditation guides are available to all users)
*/

CREATE TABLE IF NOT EXISTS meditation_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  duration text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  audio_url text DEFAULT '',
  available_offline boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meditation_guides ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read meditation guides
CREATE POLICY "Anyone can read meditation guides"
  ON meditation_guides
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meditation_guides_title_idx ON meditation_guides(title);
CREATE INDEX IF NOT EXISTS meditation_guides_duration_idx ON meditation_guides(duration);