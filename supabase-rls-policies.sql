-- Fix Row Level Security Policies for DreamMotion (ANON KEY ONLY)
-- Run these commands in your Supabase SQL Editor

-- First, drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;
DROP POLICY IF EXISTS "Service role can do everything" ON users;

-- 1. Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert their own record" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Allow authenticated users to select their own user record
CREATE POLICY "Users can view their own record" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 3. Allow authenticated users to update their own user record (for credit deduction)
CREATE POLICY "Users can update their own record" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Create or replace the decrease_user_credits function with proper security
CREATE OR REPLACE FUNCTION decrease_user_credits(amount INTEGER, uid UUID)
RETURNS VOID AS $$
BEGIN
  -- Only allow users to update their own credits
  IF auth.uid() != uid THEN
    RAISE EXCEPTION 'Access denied: You can only update your own credits';
  END IF;
  
  UPDATE users 
  SET credits = GREATEST(0, credits - amount)
  WHERE id = uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION decrease_user_credits(INTEGER, UUID) TO authenticated;

-- 7. Ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
