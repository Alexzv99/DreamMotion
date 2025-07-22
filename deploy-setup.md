# Deployment Setup Instructions

## CRITICAL: Your models don't work on production because environment variables are missing!

### Step 1: Get Your Supabase Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`sragjoqgnpikknnclppv`)
3. Go to **Settings** → **API**
4. Copy the **service_role** secret key (NOT the anon key)
5. Replace `GET_THIS_FROM_SUPABASE_DASHBOARD` in your `.env.local` file with this key

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your DreamMotion project
3. Go to **Settings** → **Environment Variables**
4. Add these variables ONE BY ONE:

```
REPLICATE_API_TOKEN = [YOUR_REPLICATE_API_TOKEN]
GOOGLE_CLIENT_ID = [YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET = [YOUR_GOOGLE_CLIENT_SECRET]
NEXTAUTH_URL = https://dreammotion.online
NEXT_PUBLIC_SITE_URL = https://dreammotion.online
NEXT_PUBLIC_SUPABASE_URL = [YOUR_SUPABASE_PROJECT_URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY = [YOUR_SERVICE_ROLE_KEY_FROM_STEP_1]
```

**IMPORTANT**: 
- Set each variable for **Production**, **Preview**, AND **Development** environments
- Make sure there are NO extra spaces in the values
- Double-check spelling exactly as shown above

### Step 3: Redeploy Your Project

1. In Vercel dashboard, go to **Deployments** tab
2. Click the "..." menu on your latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test Your Models

1. Go to https://dreammotion.online
2. Try generating an image
3. Check browser Developer Tools → Console for any errors
4. Check browser Developer Tools → Network tab for API responses

### Common Issues:

- **"Missing environment variables"** → Add them to Vercel
- **"Authentication failed"** → Check Supabase keys
- **"Replicate API error"** → Check Replicate token
- **"500 Internal Server Error"** → Check Vercel function logs

### Debug Logs:

The API now logs environment variable status. Check Vercel function logs to see:
- ✅ Environment: production
- ✅ Replicate API Token: Present 
- ✅ Supabase URL: Present
- ✅ Supabase Anon Key: Present
- ✅ Service Role Key: Present

If any show "Missing", add that variable to Vercel.
