# MindEase - Complete Database Schema

This document contains the complete SQL schema for the MindEase mental wellbeing application. Use this to replicate the exact database structure and functionality.

## Table of Contents
1. [Trigger Functions](#trigger-functions)
2. [Tables](#tables)
3. [Row Level Security Policies](#row-level-security-policies)
4. [Indexes](#indexes)
5. [Triggers](#triggers)
6. [Complete Setup Script](#complete-setup-script)

## Trigger Functions

### 1. Update Updated At Column Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. Handle New User Function
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Tables

### 1. Profiles Table
```sql
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    name text,
    email text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Journal Entries Table
```sql
CREATE TABLE IF NOT EXISTS journal_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL DEFAULT ''::text,
    content text NOT NULL DEFAULT ''::text,
    mood text DEFAULT 'neutral'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_mood_check 
    CHECK (mood = ANY (ARRAY['happy'::text, 'sad'::text, 'neutral'::text, 'angry'::text]));
```

### 3. Mood Entries Table
```sql
CREATE TABLE IF NOT EXISTS mood_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    mood text NOT NULL,
    notes text DEFAULT ''::text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE mood_entries ADD CONSTRAINT mood_entries_mood_check 
    CHECK (mood = ANY (ARRAY['happy'::text, 'sad'::text, 'neutral'::text, 'angry'::text, 'overwhelmed'::text, 'excited'::text, 'anxious'::text, 'calm'::text]));
```

### 4. Chat Messages Table
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    message text NOT NULL,
    response text NOT NULL DEFAULT ''::text,
    created_at timestamptz DEFAULT now(),
    sender text DEFAULT 'user'::text,
    flagged boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_check 
    CHECK (sender = ANY (ARRAY['user'::text, 'bot'::text]));
```

### 5. Meditation Sessions Table
```sql
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    duration integer NOT NULL DEFAULT 0,
    type text NOT NULL DEFAULT 'guided'::text,
    completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE meditation_sessions ADD CONSTRAINT meditation_sessions_duration_check 
    CHECK (duration >= 0);

ALTER TABLE meditation_sessions ADD CONSTRAINT meditation_sessions_type_check 
    CHECK (type = ANY (ARRAY['guided'::text, 'unguided'::text, 'breathing'::text, 'mindfulness'::text, 'body-scan'::text]));
```

### 6. Meditation Guides Table
```sql
CREATE TABLE IF NOT EXISTS meditation_guides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    duration text NOT NULL,
    description text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    audio_url text DEFAULT ''::text,
    available_offline boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meditation_guides ENABLE ROW LEVEL SECURITY;
```

## Row Level Security Policies

### Profiles Policies
```sql
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

### Journal Entries Policies
```sql
CREATE POLICY "Users can insert own journal entries"
    ON journal_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own journal entries"
    ON journal_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
    ON journal_entries FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
    ON journal_entries FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

### Mood Entries Policies
```sql
CREATE POLICY "Users can insert own mood entries"
    ON mood_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own mood entries"
    ON mood_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
    ON mood_entries FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
    ON mood_entries FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

### Chat Messages Policies
```sql
CREATE POLICY "Users can insert own chat messages"
    ON chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own chat messages"
    ON chat_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
    ON chat_messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
    ON chat_messages FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

### Meditation Sessions Policies
```sql
CREATE POLICY "Users can insert own meditation sessions"
    ON meditation_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own meditation sessions"
    ON meditation_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own meditation sessions"
    ON meditation_sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meditation sessions"
    ON meditation_sessions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

### Meditation Guides Policies
```sql
CREATE POLICY "Anyone can read meditation guides"
    ON meditation_guides FOR SELECT
    TO authenticated
    USING (true);
```

## Indexes

### Profiles Indexes
```sql
CREATE INDEX profiles_email_idx ON profiles USING btree (email);
```

### Journal Entries Indexes
```sql
CREATE INDEX journal_entries_user_id_idx ON journal_entries USING btree (user_id);
CREATE INDEX journal_entries_created_at_idx ON journal_entries USING btree (created_at DESC);
CREATE INDEX journal_entries_mood_idx ON journal_entries USING btree (mood);
```

### Mood Entries Indexes
```sql
CREATE INDEX mood_entries_user_id_idx ON mood_entries USING btree (user_id);
CREATE INDEX mood_entries_created_at_idx ON mood_entries USING btree (created_at DESC);
CREATE INDEX mood_entries_mood_idx ON mood_entries USING btree (mood);
```

### Chat Messages Indexes
```sql
CREATE INDEX chat_messages_user_id_idx ON chat_messages USING btree (user_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages USING btree (created_at DESC);
CREATE INDEX chat_messages_sender_idx ON chat_messages USING btree (sender);
CREATE INDEX chat_messages_flagged_idx ON chat_messages USING btree (flagged);
```

### Meditation Sessions Indexes
```sql
CREATE INDEX meditation_sessions_user_id_idx ON meditation_sessions USING btree (user_id);
CREATE INDEX meditation_sessions_created_at_idx ON meditation_sessions USING btree (created_at DESC);
CREATE INDEX meditation_sessions_type_idx ON meditation_sessions USING btree (type);
CREATE INDEX meditation_sessions_completed_idx ON meditation_sessions USING btree (completed);
```

### Meditation Guides Indexes
```sql
CREATE INDEX meditation_guides_title_idx ON meditation_guides USING btree (title);
CREATE INDEX meditation_guides_duration_idx ON meditation_guides USING btree (duration);
```

## Triggers

### Journal Entries Triggers
```sql
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Auth Users Trigger (for profile creation)
```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

## Constraints

The following constraints ensure data integrity across all tables:

### Journal Entries Constraints
```sql
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_mood_check 
    CHECK (mood = ANY (ARRAY['happy'::text, 'sad'::text, 'neutral'::text, 'angry'::text]));
```

### Mood Entries Constraints
```sql
ALTER TABLE mood_entries ADD CONSTRAINT mood_entries_mood_check 
    CHECK (mood = ANY (ARRAY['happy'::text, 'sad'::text, 'neutral'::text, 'angry'::text, 'overwhelmed'::text, 'excited'::text, 'anxious'::text, 'calm'::text]));
```

### Chat Messages Constraints
```sql
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_check 
    CHECK (sender = ANY (ARRAY['user'::text, 'bot'::text]));
```

### Meditation Sessions Constraints
```sql
ALTER TABLE meditation_sessions ADD CONSTRAINT meditation_sessions_duration_check 
    CHECK (duration >= 0);

ALTER TABLE meditation_sessions ADD CONSTRAINT meditation_sessions_type_check 
    CHECK (type = ANY (ARRAY['guided'::text, 'unguided'::text, 'breathing'::text, 'mindfulness'::text, 'body-scan'::text]));
```

## Complete Setup Script

Here's the complete script to set up the entire database from scratch:

```sql
-- =============================================
-- MindEase Database Complete Setup Script
-- =============================================

-- Create trigger functions first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    name text,
    email text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL DEFAULT ''::text,
    content text NOT NULL DEFAULT ''::text,
    mood text DEFAULT 'neutral'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mood_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    mood text NOT NULL,
    notes text DEFAULT ''::text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    message text NOT NULL,
    response text NOT NULL DEFAULT ''::text,
    created_at timestamptz DEFAULT now(),
    sender text DEFAULT 'user'::text,
    flagged boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS meditation_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    duration integer NOT NULL DEFAULT 0,
    type text NOT NULL DEFAULT 'guided'::text,
    completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meditation_guides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    duration text NOT NULL,
    description text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    audio_url text DEFAULT ''::text,
    available_offline boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_guides ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_mood_check
    CHECK (mood = ANY (ARRAY['happy'::text, 'sad'::text, 'neutral'::text, 'angry'::text]));

ALTER TABLE mood_entries ADD CONSTRAINT mood_entries_mood_check 
    CHECK (mood = ANY (ARRAY['happy'::text, 'sad'::text, 'neutral'::text, 'angry'::text, 'overwhelmed'::text, 'excited'::text, 'anxious'::text, 'calm'::text]));

ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_check 
    CHECK (sender = ANY (ARRAY['user'::text, 'bot'::text]));

ALTER TABLE meditation_sessions ADD CONSTRAINT meditation_sessions_duration_check 
    CHECK (duration >= 0);

ALTER TABLE meditation_sessions ADD CONSTRAINT meditation_sessions_type_check 
    CHECK (type = ANY (ARRAY['guided'::text, 'unguided'::text, 'breathing'::text, 'mindfulness'::text, 'body-scan'::text]));

-- Create indexes
CREATE INDEX profiles_email_idx ON profiles USING btree (email);

CREATE INDEX journal_entries_user_id_idx ON journal_entries USING btree (user_id);
CREATE INDEX journal_entries_created_at_idx ON journal_entries USING btree (created_at DESC);
CREATE INDEX journal_entries_mood_idx ON journal_entries USING btree (mood);

CREATE INDEX mood_entries_user_id_idx ON mood_entries USING btree (user_id);
CREATE INDEX mood_entries_created_at_idx ON mood_entries USING btree (created_at DESC);
CREATE INDEX mood_entries_mood_idx ON mood_entries USING btree (mood);

CREATE INDEX chat_messages_user_id_idx ON chat_messages USING btree (user_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages USING btree (created_at DESC);
CREATE INDEX chat_messages_sender_idx ON chat_messages USING btree (sender);
CREATE INDEX chat_messages_flagged_idx ON chat_messages USING btree (flagged);

CREATE INDEX meditation_sessions_user_id_idx ON meditation_sessions USING btree (user_id);
CREATE INDEX meditation_sessions_created_at_idx ON meditation_sessions USING btree (created_at DESC);
CREATE INDEX meditation_sessions_type_idx ON meditation_sessions USING btree (type);
CREATE INDEX meditation_sessions_completed_idx ON meditation_sessions USING btree (completed);

CREATE INDEX meditation_guides_title_idx ON meditation_guides USING btree (title);
CREATE INDEX meditation_guides_duration_idx ON meditation_guides USING btree (duration);

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Journal entries policies
CREATE POLICY "Users can insert own journal entries"
    ON journal_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own journal entries"
    ON journal_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
    ON journal_entries FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
    ON journal_entries FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Mood entries policies
CREATE POLICY "Users can insert own mood entries"
    ON mood_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own mood entries"
    ON mood_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
    ON mood_entries FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
    ON mood_entries FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can insert own chat messages"
    ON chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own chat messages"
    ON chat_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
    ON chat_messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
    ON chat_messages FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Meditation sessions policies
CREATE POLICY "Users can insert own meditation sessions"
    ON meditation_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own meditation sessions"
    ON meditation_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own meditation sessions"
    ON meditation_sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meditation sessions"
    ON meditation_sessions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Meditation guides policies
CREATE POLICY "Anyone can read meditation guides"
    ON meditation_guides FOR SELECT
    TO authenticated
    USING (true);

-- Create triggers
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: This trigger should be created on auth.users table (managed by Supabase Auth)
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION handle_new_user();
```

## Notes

1. **Authentication Integration**: The `profiles` table is linked to Supabase Auth's `auth.users` table. Email uniqueness is enforced by `auth.users`, not by the `profiles` table.
2. **RLS Security**: All tables have Row Level Security enabled with policies ensuring users can only access their own data
3. **Data Integrity**: Constraints ensure valid mood values and positive durations
4. **Performance**: Indexes are optimized for common query patterns (user-based, time-based, mood-based)
5. **Trigger Functions**: Automatic timestamp updates and profile creation on user signup
6. **Mood Constraints**: Note that `mood_entries` supports 8 mood types while `journal_entries` supports only 4 (as per frontend requirements)  
7. **Profile Email**: The `profiles.email` column does not have a unique constraint since email uniqueness is already enforced by Supabase Auth's `auth.users` table

This schema provides a complete, secure, and performant foundation for the MindEase mental wellbeing application.