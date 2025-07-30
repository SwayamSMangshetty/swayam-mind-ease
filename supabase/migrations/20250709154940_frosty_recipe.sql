/*
  # Update chat messages table structure

  1. Changes to existing tables
    - Rename `user_message` to `message` in `chat_messages` table
    - Rename `bot_response` to `response` in `chat_messages` table  
    - Add `sender` column to distinguish between user and bot messages
    - Add `flagged` column for content moderation

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add sender column to distinguish user vs bot messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'sender'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN sender TEXT DEFAULT 'user';
  END IF;
END $$;

-- Add CHECK constraint for sender values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chat_messages_sender_check'
  ) THEN
    ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_check 
    CHECK (sender IN ('user', 'bot'));
  END IF;
END $$;

-- Add flagged column for content moderation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'flagged'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN flagged boolean DEFAULT false;
  END IF;
END $$;

-- Rename columns if they exist with old names
DO $$
BEGIN
  -- Rename user_message to message if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'user_message'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'message'
  ) THEN
    ALTER TABLE chat_messages RENAME COLUMN user_message TO message;
  END IF;

  -- Rename bot_response to response if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'bot_response'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'response'
  ) THEN
    ALTER TABLE chat_messages RENAME COLUMN bot_response TO response;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_messages_sender_idx ON chat_messages(sender);
CREATE INDEX IF NOT EXISTS chat_messages_flagged_idx ON chat_messages(flagged);