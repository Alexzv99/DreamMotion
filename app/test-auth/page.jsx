'use client';
import { supabase } from '../supabaseClient';

export default function TestAuth() {
  const testGoogleAuth = async () => {
    try {
      console.log('Testing Google Auth...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key Preview:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
      
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('Auth response:', { data, error });
      
      if (error) {
        console.error('Auth error details:', error);
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Caught error:', err);
      alert(`Caught error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Google Auth</h1>
      <button onClick={testGoogleAuth} style={{ 
        padding: '10px 20px', 
        fontSize: '16px',
        backgroundColor: '#4285f4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Test Google Sign In
      </button>
    </div>
  );
}
