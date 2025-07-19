import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sragjoqgnpikknnclppv.supabase.co'

export const supabase = createClient(supabaseUrl)
