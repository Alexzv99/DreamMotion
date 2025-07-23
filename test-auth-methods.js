// Test authentication methods
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sragjoqgnpikknnclppv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWdqb3FnbnBpa2tubmNscHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTAyMjksImV4cCI6MjA2NzI2NjIyOX0.zOWjpC0DqRYioyMLG0c2rGDo2TaLjQ3tGbj24kYwzJY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('🔐 Testing authentication methods...\n')
  
  // Test 1: Google OAuth setup
  console.log('📱 Testing Google OAuth configuration...')
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://dreammotion.online/dashboard'
      }
    })
    
    if (error) {
      console.error('❌ Google OAuth failed:', error.message)
      console.error('Full error:', error)
      
      // Check if it's specifically about disabled API keys
      if (error.message.includes('disabled') || error.message.includes('legacy')) {
        console.error('🚨 This IS the legacy API key issue!')
      }
    } else {
      console.log('✅ Google OAuth configured correctly')
      console.log('OAuth data:', data)
    }
  } catch (err) {
    console.error('❌ Google OAuth exception:', err.message)
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Test 2: Email/Password authentication (won't actually login)
  console.log('📧 Testing email/password authentication...')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword'
    })
    
    if (error) {
      // We expect this to fail with "invalid credentials", not "disabled API"
      if (error.message.includes('disabled') || error.message.includes('legacy')) {
        console.error('❌ Email auth failed due to API key issue:', error.message)
      } else if (error.message.includes('Invalid login credentials')) {
        console.log('✅ Email auth working (failed as expected with wrong credentials)')
      } else {
        console.log('⚠️ Email auth failed with:', error.message)
      }
    }
  } catch (err) {
    console.error('❌ Email auth exception:', err.message)
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Test 3: Check auth providers
  console.log('🔍 Checking available auth providers...')
  try {
    // This might not work in Node.js, but let's try
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      const settings = await response.json()
      console.log('✅ Auth settings:', JSON.stringify(settings, null, 2))
    } else {
      console.log('⚠️ Could not fetch auth settings:', response.status, response.statusText)
    }
  } catch (err) {
    console.log('⚠️ Could not check auth providers:', err.message)
  }
}

testAuth()
