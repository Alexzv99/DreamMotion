// Test with a proper UUID format
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = 'https://sragjoqgnpikknnclppv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWdqb3FnbnBpa2tubmNscHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTAyMjksImV4cCI6MjA2NzI2NjIyOX0.zOWjpC0DqRYioyMLG0c2rGDo2TaLjQ3tGbj24kYwzJY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWithUUID() {
  console.log('🔍 Testing credit system with proper UUID...\n')
  
  // Generate a proper UUID
  const testUserId = randomUUID()
  console.log('Generated UUID:', testUserId)
  
  try {
    console.log('1️⃣ Creating user with UUID...')
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
      return false
    }
    
    console.log('✅ User created successfully!')
    console.log('User data:', data)
    
    console.log('\n2️⃣ Testing credit deduction...')
    const { error: deductError } = await supabase.rpc('decrease_user_credits', {
      amount: 3,
      uid: testUserId
    })
    
    if (deductError) {
      console.error('❌ Credit deduction failed:', deductError.message)
      console.error('Full error:', deductError)
    } else {
      console.log('✅ Credit deduction successful!')
      
      // Check credits after deduction
      const { data: updatedUser, error: checkError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', testUserId)
        .single()
      
      if (checkError) {
        console.error('❌ Could not verify credits:', checkError.message)
      } else {
        console.log('Credits after deduction:', updatedUser.credits)
        console.log('Expected: 7, Actual:', updatedUser.credits)
        
        if (updatedUser.credits === 7) {
          console.log('🎉 Credit deduction working perfectly!')
        } else {
          console.log('⚠️ Credit deduction amount incorrect')
        }
      }
    }
    
    // Clean up
    await supabase.from('users').delete().eq('id', testUserId)
    console.log('🧹 Test user cleaned up')
    
    return true
    
  } catch (err) {
    console.error('❌ Test failed with exception:', err.message)
    return false
  }
}

// Also check what Supabase auth user IDs look like
async function checkAuthUserIdFormat() {
  console.log('\n🔍 Checking Supabase auth user ID format...\n')
  
  // Since we can't actually log in from Node.js, let's check what format they use
  console.log('Supabase auth user IDs are UUIDs in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
  console.log('Example UUID:', randomUUID())
  console.log('Your API route needs to handle UUIDs properly when creating users.')
}

testWithUUID()
  .then(success => {
    checkAuthUserIdFormat()
    
    if (success) {
      console.log('\n🎉 UUID-based credit system works!')
      console.log('💡 The issue is likely that Supabase auth provides UUID user IDs,')
      console.log('   but your error handling might not be working with them properly.')
    } else {
      console.log('\n💥 Even with UUIDs, there are still issues.')
    }
  })
