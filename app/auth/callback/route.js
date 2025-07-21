import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  if (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=session_error`)
      }

      if (data?.session) {
        console.log('Auth successful, redirecting to dashboard')
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
