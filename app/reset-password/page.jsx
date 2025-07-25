"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';

// Component that uses searchParams - needs to be wrapped in Suspense
function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper function to check if error is related to expired/used link
  const isExpiredLinkError = () => {
    return error && (error.includes('expired') || error.includes('used already') || error.includes('invalid'));
  };

  // Function to redirect to login page for new reset request
  const handleRequestNewLink = () => {
    router.push('/login');
  };

  useEffect(() => {
    // Handle auth state changes and check for reset session
    const handleAuthStateChange = async () => {
      // First check URL parameters for auth tokens
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        // Set the session from URL parameters
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          setError('This password reset link has expired or been used already. Please request a new password reset from the login page.');
          return;
        }
        
        // Clear URL parameters after successful session setup
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('This password reset link is invalid, expired, or has already been used. Please request a new password reset from the login page.');
        }
      }
    };
    
    handleAuthStateChange();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      setError('Failed to update password: ' + error.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
      backdropFilter: 'blur(2px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/background-video4.mp4" type="video/mp4" />
      </video>
      
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }} />

      <button
        onClick={() => router.push('/login')}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif',
          backdropFilter: 'blur(8px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        }}
      >
        ← Back to Login
      </button>

      {/* Success/Error Messages */}
      {(message || error) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: message ? '#d4edda' : '#f8d7da',
          color: message ? '#155724' : '#721c24',
          border: `1px solid ${message ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px',
          padding: '12px 20px',
          zIndex: 1000,
          maxWidth: '90vw',
          minWidth: '260px',
          fontSize: '1rem',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: isExpiredLinkError() ? '12px' : '0' }}>
            {message || error}
          </div>
          {isExpiredLinkError() && (
            <button
              onClick={handleRequestNewLink}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#c82333'}
              onMouseOut={(e) => e.target.style.background = '#dc3545'}
            >
              Request New Reset Link
            </button>
          )}
        </div>
      )}

      <div style={{
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 2px 18px rgba(30,30,40,0.15)',
        padding: '40px 40px 35px 40px',
        maxWidth: '420px',
        width: '90vw',
        textAlign: 'center',
        zIndex: 2,
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#111'
        }}>
          Reset Password
        </h1>
        
        <p style={{
          fontSize: '1rem',
          color: '#666',
          marginBottom: '30px',
          lineHeight: 1.5
        }}>
          Enter your new password below
        </p>

        <form onSubmit={handleResetPassword} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1.5px solid #d1d5db',
              fontSize: '1rem',
              fontWeight: '500',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            required
            minLength={6}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1.5px solid #d1d5db',
              fontSize: '1rem',
              fontWeight: '500',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            required
            minLength={6}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px 20px',
              borderRadius: '10px',
              background: loading ? '#ccc' : '#1b1b1b',
              color: '#fff',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  );
}

// Loading component for Suspense fallback
function LoadingResetPassword() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem' }}>Loading password reset...</div>
      </div>
    </main>
  );
}

// Main component that wraps ResetPasswordForm in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingResetPassword />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
