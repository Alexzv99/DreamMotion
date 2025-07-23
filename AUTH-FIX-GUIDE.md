# Fix Supabase Legacy API Keys Error

## 🚨 Error: "Legacy API keys are disabled"

This error occurs when your Supabase project has updated security settings that disable legacy authentication methods.

## 🔧 Solution Steps

### Step 1: Enable Proper Authentication in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `sragjoqgnpikknnclppv`
3. Go to **Authentication** → **Settings**

### Step 2: Check API Settings

In the **API Settings** section, make sure:

- ✅ **JWT expiry**: Set to reasonable time (default: 3600 seconds)
- ✅ **Refresh token rotation**: Enabled (recommended)
- ✅ **Enable email confirmations**: Check if you want email verification

### Step 3: Enable OAuth Providers (if using Google login)

Go to **Authentication** → **Providers**:

1. **Enable Google Provider**:
   - Toggle Google provider ON
   - Add your Google Client ID: `[Your Google Client ID]`
   - Add your Google Client Secret: `[Your Google Client Secret]`
   - Set Redirect URL: `https://dreammotion.online/auth/callback`

2. **Enable Email Provider** (if using email/password):
   - Toggle Email provider ON
   - Configure SMTP settings if needed

### Step 4: Update Site URL Settings

In **Authentication** → **URL Configuration**:

- **Site URL**: `https://dreammotion.online`
- **Redirect URLs**: Add these:
  - `https://dreammotion.online/auth/callback`
  - `http://localhost:3000/auth/callback` (for local development)

### Step 5: Check RLS Policies

Make sure your RLS policies are correct. Run this SQL in **SQL Editor**:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check existing policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
```

### Step 6: Test Authentication

1. Clear your browser cache and cookies for `dreammotion.online`
2. Try logging in again
3. Check browser console for any errors

## 🔍 Common Issues and Solutions

### Issue 1: Invalid JWT
**Solution**: The anon key might be regenerated. Get new keys:
1. Go to **Settings** → **API**
2. Copy the new `anon` public key
3. Update your environment variables

### Issue 2: CORS Issues
**Solution**: Make sure your domain is in the allowed origins:
1. Go to **Authentication** → **Settings**
2. Add your domain to **Additional Redirect URLs**

### Issue 3: Google OAuth Configuration
**Solution**: 
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update your OAuth consent screen
3. Add `https://sragjoqgnpikknnclppv.supabase.co/auth/v1/callback` as authorized redirect URI

## 📝 If You Need New API Keys

If your current anon key is invalid:

1. Go to **Settings** → **API** in Supabase
2. Look for any warnings about deprecated keys
3. Copy the new `anon` public key
4. Update your `.env.local` and Vercel environment variables

## 🚨 Emergency Fix

If nothing works, try regenerating your API keys:

1. Go to **Settings** → **API**
2. Click **Reset API Keys** (⚠️ This will break existing sessions)
3. Update all your environment variables with new keys
4. Redeploy your application

## ✅ Success Indicators

After fixing, you should see:
- ✅ No "Legacy API keys" error
- ✅ Successful login/registration
- ✅ Proper user session management
- ✅ Working credit system
