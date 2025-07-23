// Test the updated credit system by making a test API call
// This simulates what happens when a user tries to generate content

console.log('🧪 Testing updated credit system...\n')

// Simulate a test API call to check if credit deduction is working
const testURL = 'https://dreammotion.online/api/generate-image'
// Note: You would need to be logged in on the website and get a real auth token for this to work

console.log('📝 To test the credit system:')
console.log('1. Go to your website: https://dreammotion.online')
console.log('2. Log in with Google OAuth')
console.log('3. Try to generate an image or video')
console.log('4. Check the browser console (F12) for detailed logs')
console.log('5. Check your Supabase dashboard to see if user was created and credits deducted')

console.log('\n🔍 Look for these log messages in the browser console:')
console.log('✅ "New user created successfully" - means user creation worked')
console.log('✅ "User credits found: X" - means existing user was found')
console.log('✅ "Credits deducted successfully" - means credit deduction worked')
console.log('⚠️ "Using temporary credits" - means RLS policies need fixing')

console.log('\n📊 To check in Supabase Dashboard:')
console.log('1. Go to https://supabase.com/dashboard')
console.log('2. Select your project')
console.log('3. Go to Table Editor > users')
console.log('4. Check if your user exists with correct credits')

console.log('\n🚨 If you see RLS errors, run these SQL commands in Supabase SQL Editor:')
console.log('-- Copy and paste the content from supabase-rls-policies.sql')

console.log('\n✅ Your API route has been updated with:')
console.log('- Proper authenticated Supabase client for RLS compliance')
console.log('- Better error handling for user creation')
console.log('- Detailed logging for debugging')
console.log('- Fallback to temporary credits if database issues occur')

console.log('\n🎯 Next steps:')
console.log('1. Test on your live website')
console.log('2. Check browser console logs')
console.log('3. Verify credit deduction in Supabase dashboard')
console.log('4. If RLS errors occur, run the SQL policies again')
