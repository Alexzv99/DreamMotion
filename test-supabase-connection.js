import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sragjoqgnpikknnclppv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWdqb3FnbnBpa2tubmNscHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTAyMjksImV4cCI6MjA2NzI2NjIyOX0.zOWjpC0DqRYioyMLG0c2rGDo2TaLjQ3tGbj24kYwzJY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');

  try {
    // Test 1: Basic connection test
    console.log('\n1️⃣ Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error);
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Connection test successful!');
      console.log('📊 Response data:', data);
    }

    // Test 2: Check if 'users' table exists and is accessible
    console.log('\n2️⃣ Testing users table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Users table access failed:', tableError);
      console.log('This might indicate:');
      console.log('- Table does not exist');
      console.log('- RLS (Row Level Security) is blocking access');
      console.log('- Insufficient permissions');
    } else {
      console.log('✅ Users table accessible!');
      console.log('📊 Sample data:', tableData);
    }

    // Test 3: Auth service test
    console.log('\n3️⃣ Testing Auth service...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth service error:', authError);
    } else {
      console.log('✅ Auth service working!');
      console.log('👤 Current user:', user ? 'Authenticated' : 'Not authenticated');
    }

  } catch (err) {
    console.log('💥 Unexpected error:', err);
  }
}

testConnection();
