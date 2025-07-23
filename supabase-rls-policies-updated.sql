-- UPDATED Row Level Security Policies for DreamMotion (ANON KEY ONLY)
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it

-- 1. First, drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;
DROP POLICY IF EXISTS "Service role can do everything" ON users;

-- 2. Ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert their own record" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Allow authenticated users to select their own user record
CREATE POLICY "Users can view their own record" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 6. Allow authenticated users to update their own user record (for credit deduction)
CREATE POLICY "Users can update their own record" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 7. Create or replace the decrease_user_credits function with proper security
CREATE OR REPLACE FUNCTION decrease_user_credits(amount INTEGER, uid UUID)
RETURNS VOID AS $$
BEGIN
  -- Only allow users to update their own credits
  IF auth.uid() != uid THEN
    RAISE EXCEPTION 'Access denied: You can only update your own credits';
  END IF;
  
  -- Check if user exists first
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = uid) THEN
    RAISE EXCEPTION 'User not found: %', uid;
  END IF;
  
  -- Update credits, ensuring they don't go below 0
  UPDATE users 
  SET credits = GREATEST(0, credits - amount)
  WHERE id = uid;
  
  -- Verify the update happened
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update credits for user: %', uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION decrease_user_credits(INTEGER, UUID) TO authenticated;

-- 9. Add helpful constraints and indexes
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits);

-- 10. Verify the setup
SELECT 
  'Setup verification:' as status,
  'Users table exists' as users_table,
  'RLS enabled: ' || (SELECT row_security FROM pg_tables WHERE tablename = 'users') as rls_status;

-- Show current policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users';

-- Test the function existence
SELECT 'Function exists: ' || CASE WHEN EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'decrease_user_credits'
) THEN 'YES' ELSE 'NO' END as function_status;
