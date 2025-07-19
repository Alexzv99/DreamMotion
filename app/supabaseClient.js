import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

console.log('🔧 Supabase client initialized with:', { 
  url: supabaseUrl, 
  keyPreview: supabaseKey.substring(0, 20) + '...' 
});

export const supabase = createClient(supabaseUrl, supabaseKey)
