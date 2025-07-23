// Test credit deduction system
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sragjoqgnpikknnclppv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWdqb3FnbnBpa2tubmNscHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTAyMjksImV4cCI6MjA2NzI2NjIyOX0.zOWjpC0DqRYioyMLG0c2rGDo2TaLjQ3tGbj24kYwzJY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCreditSystem() {
  console.log('💰 Testing credit deduction system...\n')
  
  // First, let's check if the function exists
  console.log('1️⃣ Checking if decrease_user_credits function exists...')
  try {
    const { data, error } = await supabase.rpc('decrease_user_credits', {
      amount: 1,
      uid: 'test-user-id'
    })
    
    if (error) {
      console.error('❌ Function test failed:', error.message)
      
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.error('🚨 CRITICAL: The decrease_user_credits function does not exist!')
        console.error('📝 You need to run the SQL setup commands to create this function.')
        return false
      } else {
        console.log('⚠️ Function exists but failed (expected for test user):', error.message)
      }
    } else {
      console.log('✅ Function exists and responded')
    }
  } catch (err) {
    console.error('❌ Function test exception:', err.message)
    return false
  }
  
  console.log('\n2️⃣ Checking users table access...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(0)
    
    if (error) {
      console.error('❌ Users table access failed:', error.message)
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.error('🚨 CRITICAL: Row Level Security is blocking access!')
        console.error('📝 You need to update your RLS policies.')
        return false
      }
    } else {
      console.log('✅ Users table accessible')
      console.log('Total users count:', data?.[0]?.count || 'unknown')
    }
  } catch (err) {
    console.error('❌ Users table test exception:', err.message)
    return false
  }
  
  console.log('\n3️⃣ Testing user creation (simulated)...')
  const testUserId = 'test-user-' + Date.now()
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: testUserId,
        email: 'test@example.com',
        credits: 10,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('❌ User creation failed:', error.message)
      console.error('Full error:', error)
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.error('🚨 CRITICAL: RLS policies are blocking user creation!')
      }
      return false
    } else {
      console.log('✅ User creation successful')
      console.log('Created user:', data)
      
      // Test credit deduction on this user
      console.log('\n4️⃣ Testing credit deduction on created user...')
      const { error: deductError } = await supabase.rpc('decrease_user_credits', {
        amount: 2,
        uid: testUserId
      })
      
      if (deductError) {
        console.error('❌ Credit deduction failed:', deductError.message)
      } else {
        console.log('✅ Credit deduction successful')
        
        // Verify credits were deducted
        const { data: updatedUser, error: checkError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', testUserId)
          .single()
        
        if (checkError) {
          console.error('❌ Could not verify credit deduction:', checkError.message)
        } else {
          console.log('✅ Credits after deduction:', updatedUser.credits)
          console.log('Expected: 8, Actual:', updatedUser.credits)
        }
      }
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', testUserId)
      console.log('🧹 Test user cleaned up')
    }
  } catch (err) {
    console.error('❌ User creation exception:', err.message)
    return false
  }
  
  return true
}

testCreditSystem().then(success => {
  if (success) {
    console.log('\n🎉 Credit system tests completed!')
  } else {
    console.log('\n💥 Credit system has issues. Check the errors above.')
  }
})
