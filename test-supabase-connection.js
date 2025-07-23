// Test Supabase connection and API key validity
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sragjoqgnpikknnclppv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWdqb3FnbnBpa2tubmNscHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTAyMjksImV4cCI6MjA2NzI2NjIyOX0.zOWjpC0DqRYioyMLG0c2rGDo2TaLjQ3tGbj24kYwzJY'

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key preview:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n📡 Testing basic connection...')
    
    // Test 1: Basic connection test
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(0)
    
    if (error) {
      console.error('❌ Basic connection failed:', error.message)
      console.error('Full error:', error)
      return false
    }
    
    console.log('✅ Basic connection successful')
    
    // Test 2: Auth service test
    console.log('\n🔐 Testing auth service...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth service failed:', authError.message)
      console.error('Full auth error:', authError)
      return false
    }
    
    console.log('✅ Auth service accessible')
    console.log('Current session:', authData.session ? 'Active' : 'None')
    
    // Test 3: Check if API key is truly functional
    console.log('\n🔑 Testing API key functionality...')
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError && userError.message.includes('disabled')) {
      console.error('❌ API key is disabled:', userError.message)
      return false
    }
    
    console.log('✅ API key is functional')
    
    return true
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Supabase connection is working.')
  } else {
    console.log('\n💥 Connection tests failed. Check the errors above.')
  }
})
