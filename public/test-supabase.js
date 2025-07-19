// Simple Supabase test to isolate the database issue
import { createClient } from '@supabase/supabase-js';

// Use environment variables (these will be available in the browser as NEXT_PUBLIC_*)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sragjoqgnpikknnclppv.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWdqb3FnbnBpa2tubmNscHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTAyMjksImV4cCI6MjA2NzI2NjIyOX0.zOWjpC0DqRYioyMLG0c2rGDo2TaLjQ3tGbj24kYwzJY';

console.log('🔧 Test using:', { url: supabaseUrl, keyPreview: supabaseKey.substring(0, 20) + '...' });

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectQuery() {
  console.log('🧪 Testing direct Supabase query...');
  
  try {
    // Test 1: Basic connection
    const { data: basicTest, error: basicError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    console.log('Basic test result:', { data: basicTest, error: basicError });
    
    // Test 2: Specific user query simulation
    const testUserId = '13203422-5b33-419f-9e63-d300fc96eae0'; // From our previous test
    
    const { data: specificTest, error: specificError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', testUserId)
      .single();
    
    console.log('Specific user test result:', { data: specificTest, error: specificError });
    
    // Test 3: Empty error reproduction
    const fakeUserId = 'fake-user-id-123';
    
    const { data: fakeTest, error: fakeError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', fakeUserId)
      .single();
    
    console.log('Fake user test result:', { data: fakeTest, error: fakeError });
    console.log('Fake error stringified:', JSON.stringify(fakeError));
    console.log('Fake error type:', typeof fakeError);
    console.log('Fake error object keys:', Object.keys(fakeError || {}));
    
  } catch (err) {
    console.error('Test failed with exception:', err);
  }
}

// Make it available globally
window.testSupabase = testDirectQuery;

console.log('Supabase test loaded. Run window.testSupabase() in console to test.');
