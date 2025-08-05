/*
  # Enable RLS Policies for MindEase Application

  1. Security Setup
    - Enable RLS on all tables (if not already enabled)
    - Create comprehensive policies for user data isolation
    - Ensure authenticated users can only access their own data
    - Allow public read access to meditation guides

  2. Policy Coverage
    - profiles: Full CRUD for own profile
    - journal_entries: Full CRUD for own entries
    - mood_entries: Full CRUD for own mood data
    - chat_messages: Full CRUD for own chat history
    - meditation_sessions: Full CRUD for own meditation data
    - meditation_guides: Read-only access for all authenticated users

  3. Safety Features
    - Uses conditional logic to avoid duplicate policy errors
    - Checks for existing policies before creation
    - Ensures sign-up flow remains unaffected
*/

-- Enable RLS on all tables (safe if already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_guides ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$
BEGIN
    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON profiles FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
    END IF;

    -- Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile"
            ON profiles FOR SELECT
            TO authenticated
            USING (auth.uid() = id);
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON profiles FOR UPDATE
            TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can delete own profile'
    ) THEN
        CREATE POLICY "Users can delete own profile"
            ON profiles FOR DELETE
            TO authenticated
            USING (auth.uid() = id);
    END IF;
END $$;

-- Journal Entries Policies
DO $$
BEGIN
    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'journal_entries' 
        AND policyname = 'Users can insert own journal entries'
    ) THEN
        CREATE POLICY "Users can insert own journal entries"
            ON journal_entries FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'journal_entries' 
        AND policyname = 'Users can read own journal entries'
    ) THEN
        CREATE POLICY "Users can read own journal entries"
            ON journal_entries FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'journal_entries' 
        AND policyname = 'Users can update own journal entries'
    ) THEN
        CREATE POLICY "Users can update own journal entries"
            ON journal_entries FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'journal_entries' 
        AND policyname = 'Users can delete own journal entries'
    ) THEN
        CREATE POLICY "Users can delete own journal entries"
            ON journal_entries FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Mood Entries Policies
DO $$
BEGIN
    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can insert own mood entries'
    ) THEN
        CREATE POLICY "Users can insert own mood entries"
            ON mood_entries FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can read own mood entries'
    ) THEN
        CREATE POLICY "Users can read own mood entries"
            ON mood_entries FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can update own mood entries'
    ) THEN
        CREATE POLICY "Users can update own mood entries"
            ON mood_entries FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can delete own mood entries'
    ) THEN
        CREATE POLICY "Users can delete own mood entries"
            ON mood_entries FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Chat Messages Policies
DO $$
BEGIN
    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_messages' 
        AND policyname = 'Users can insert own chat messages'
    ) THEN
        CREATE POLICY "Users can insert own chat messages"
            ON chat_messages FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_messages' 
        AND policyname = 'Users can read own chat messages'
    ) THEN
        CREATE POLICY "Users can read own chat messages"
            ON chat_messages FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_messages' 
        AND policyname = 'Users can update own chat messages'
    ) THEN
        CREATE POLICY "Users can update own chat messages"
            ON chat_messages FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_messages' 
        AND policyname = 'Users can delete own chat messages'
    ) THEN
        CREATE POLICY "Users can delete own chat messages"
            ON chat_messages FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Meditation Sessions Policies
DO $$
BEGIN
    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'meditation_sessions' 
        AND policyname = 'Users can insert own meditation sessions'
    ) THEN
        CREATE POLICY "Users can insert own meditation sessions"
            ON meditation_sessions FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'meditation_sessions' 
        AND policyname = 'Users can read own meditation sessions'
    ) THEN
        CREATE POLICY "Users can read own meditation sessions"
            ON meditation_sessions FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'meditation_sessions' 
        AND policyname = 'Users can update own meditation sessions'
    ) THEN
        CREATE POLICY "Users can update own meditation sessions"
            ON meditation_sessions FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'meditation_sessions' 
        AND policyname = 'Users can delete own meditation sessions'
    ) THEN
        CREATE POLICY "Users can delete own meditation sessions"
            ON meditation_sessions FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Meditation Guides Policies (Public read access for authenticated users)
DO $$
BEGIN
    -- Select policy (read-only for all authenticated users)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'meditation_guides' 
        AND policyname = 'Anyone can read meditation guides'
    ) THEN
        CREATE POLICY "Anyone can read meditation guides"
            ON meditation_guides FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;