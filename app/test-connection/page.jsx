'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment variables:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? 'Present' : 'Missing'
})

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Testing Supabase connection...')
        
        // Test 1: Check if we can get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User check result:', { user, userError })
        
        if (userError) {
          console.error('User error:', userError)
          setError(`User error: ${userError.message}`)
          setConnectionStatus('Failed - User Auth Error')
          return
        }

        setUser(user)

        if (user) {
          // Test 2: Try to fetch user credits
          console.log('Fetching credits for user:', user.id)
          const { data: userData, error: creditsError } = await supabase
            .from('users')
            .select('credits')
            .eq('user_id', user.id)
            .single()

          console.log('Credits fetch result:', { userData, creditsError })

          if (creditsError) {
            console.error('Credits error:', creditsError)
            setError(`Credits error: ${creditsError.message}`)
            setConnectionStatus('Failed - Credits Fetch Error')
          } else {
            setCredits(userData?.credits || 0)
            setConnectionStatus('Success - Connected and fetched data!')
          }
        } else {
          setConnectionStatus('Success - Connected but not logged in')
        }

      } catch (err) {
        console.error('Test connection error:', err)
        setError(`Connection error: ${err.message}`)
        setConnectionStatus('Failed - Connection Error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Connection Status:</h2>
          <p className={`mt-2 ${connectionStatus.includes('Success') ? 'text-green-600' : connectionStatus.includes('Failed') ? 'text-red-600' : 'text-yellow-600'}`}>
            {connectionStatus}
          </p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Environment Variables:</h2>
          <p>Supabase URL: {supabaseUrl ? '✓ Present' : '❌ Missing'}</p>
          <p>Supabase Key: {supabaseAnonKey ? '✓ Present' : '❌ Missing'}</p>
        </div>

        {user && (
          <div className="p-4 border rounded">
            <h2 className="font-semibold">User Info:</h2>
            <p>Email: {user.email}</p>
            <p>User ID: {user.id}</p>
            <p>Credits: {credits !== null ? credits : 'Loading...'}</p>
          </div>
        )}

        {error && (
          <div className="p-4 border rounded bg-red-50">
            <h2 className="font-semibold text-red-800">Error Details:</h2>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold text-blue-800">Instructions:</h2>
          <p className="text-blue-600 mt-2">
            Open the browser console (F12) to see detailed logs of the connection test.
          </p>
        </div>
      </div>
    </div>
  )
}
