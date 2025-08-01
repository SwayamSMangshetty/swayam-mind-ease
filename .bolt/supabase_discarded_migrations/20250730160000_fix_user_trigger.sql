/*
  # Fix handle_new_user trigger function

  1. Problem
    - The trigger function was not properly accessing the name from user metadata
    - This was causing database errors during user signup

  2. Solution
    - Update the handle_new_user function to properly access name from raw_user_meta_data
    - Add better error handling and fallback values
    - Ensure the function works with the current auth signup flow
*/

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to properly handle user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
BEGIN
  -- Extract name from user metadata with proper fallback
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1), -- Use email prefix as fallback
    'User' -- Final fallback
  );

  -- Insert profile with proper error handling
  INSERT INTO profiles (id, name, email)
  VALUES (NEW.id, user_name, NEW.email)
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate profile creation

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 