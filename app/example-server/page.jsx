import { createClient } from '@/utils/supabase/server'

export default async function ExampleServerPage() {
  const supabase = await createClient()

  // Example: Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error('Error getting user:', userError)
    return <div>Error loading user data</div>
  }

  if (!user) {
    return <div>Please log in to view this page</div>
  }

  // Example: Fetch user credits from the database
  const { data: userData, error: creditsError } = await supabase
    .from('users')
    .select('credits')
    .eq('user_id', user.id)
    .single()

  if (creditsError) {
    console.error('Error fetching credits:', creditsError)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Server-Side Supabase Example</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">User Information:</h2>
          <p>Email: {user.email}</p>
          <p>User ID: {user.id}</p>
          <p>Credits: {userData?.credits || 'N/A'}</p>
        </div>

        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold text-blue-800">Note:</h2>
          <p className="text-blue-600 mt-2">
            This page uses server-side rendering with Supabase SSR. 
            The user data is fetched on the server before the page is sent to the browser.
          </p>
        </div>
      </div>
    </div>
  )
}
