# DreamMotion - Supabase Setup Guide (Anon Key Only)

## 🎯 Current Issue
- Models work locally but fail on production
- Credit deduction fails
- New user registration fails
- Error: "Database error" when registering

## 🔧 Root Cause
Row Level Security (RLS) policies are blocking authenticated users from:
1. Creating their own user record
2. Updating their own credits

## ✅ Solution Steps

### Step 1: Update Supabase RLS Policies

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`sragjoqgnpikknnclppv`)
3. Go to **SQL Editor**
4. Copy and paste this SQL code:

```sql
-- Fix Row Level Security Policies for DreamMotion (ANON KEY ONLY)

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
```

5. Click **Run** to execute the SQL

### Step 2: Verify Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your DreamMotion project
3. Go to **Settings** → **Environment Variables**
4. Make sure these are set:

```
REPLICATE_API_TOKEN = [your token]
GOOGLE_CLIENT_ID = [your client id]
GOOGLE_CLIENT_SECRET = [your client secret]
NEXTAUTH_URL = https://dreammotion.online
NEXT_PUBLIC_SITE_URL = https://dreammotion.online
NEXT_PUBLIC_SUPABASE_URL = https://sragjoqgnpikknnclppv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your anon key]
```

**Note**: NO service role key needed anymore!

### Step 3: Deploy and Test

1. Your code is already updated and committed
2. Vercel should auto-deploy when you push to main
3. Wait for deployment to complete
4. Test by:
   - Registering a new user
   - Generating an image
   - Checking credits deduction

### Step 4: Debug if Still Issues

If you still have problems, check:

1. **Vercel Function Logs**:
   - Go to Vercel → Functions tab
   - Look for error messages

2. **Browser Console**:
   - Open Developer Tools → Console
   - Look for API errors

3. **Expected Success Logs**:
   ```
   ✅ Environment: production
   ✅ Replicate API Token: Present
   ✅ Supabase URL: Present
   ✅ Supabase Anon Key: Present
   ✅ New user created successfully
   ✅ Credits deducted successfully
   ```

## 🚀 What Changed in Code

1. **Removed service role dependency**
2. **Simplified user creation** - single strategy using authenticated user
3. **Better error messages** with specific suggestions
4. **Fallback to temporary credits** if database fails
5. **Enhanced logging** for debugging

## 🔍 Testing Checklist

- [ ] SQL policies executed successfully
- [ ] Environment variables set in Vercel
- [ ] Code deployed to production
- [ ] New user registration works
- [ ] Image generation works
- [ ] Credits are deducted properly
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs

Your models should now work perfectly on both localhost AND production! 🎉
