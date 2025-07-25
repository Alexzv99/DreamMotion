"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('video4'); // Fixed background
  const router = useRouter();

  // Load saved background preference from localStorage
  useEffect(() => {
    // Always use video4 background
    setSelectedBackground('video4');
  }, []);

  // Google login handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: 'https://dreammotion.online/dashboard'
      }
    });
    setLoading(false);
    if (error) {
      setErrorBanner('Google login failed: ' + error.message);
      console.error('Google login error:', error);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorBanner('Please enter your email address first');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://dreammotion.online/reset-password',
      });
      
      setLoading(false);
      
      if (error) {
        console.error('Password reset error:', error);
        setErrorBanner('Password reset failed: ' + error.message);
      } else {
        console.log('Password reset success:', data);
        setErrorBanner('Password reset email sent! Check your inbox and spam folder. Look for an email from Supabase with a "Reset Password" link. If the link is hidden, check the full email content or try opening it in a different email client.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setLoading(false);
      setErrorBanner('An unexpected error occurred. Please try again.');
    }
  };
  // Auto-hide error banner after 3 seconds
  useEffect(() => {
    if (errorBanner) {
      const timer = setTimeout(() => setErrorBanner(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorBanner]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setErrorBanner('Login failed: ' + error.message);
    } else {
      router.push('/dashboard');
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
        src="/background-video4.mp4"
      />
      
      <button
        onClick={() => router.back()}
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
        ← Back
      </button>
      {/* ...existing code... */}
      <style>{`
        @media (max-width: 900px) {
          .login-card {
            max-width: 98vw !important;
            padding: 18px 2vw !important;
            font-size: 1rem !important;
            border-radius: 10px !important;
          }
          .login-form input, .login-form button {
            font-size: 1rem !important;
            padding: 10px !important;
            border-radius: 8px !important;
          }
        }
        @media (max-width: 600px) {
          .login-card {
            padding: 12px 1vw !important;
            font-size: 0.98rem !important;
          }
        }
        @media (max-width: 480px) {
          .login-card {
            max-width: 90vw !important;
            padding: 16px 1vw !important;
            font-size: 0.9rem !important;
            border-radius: 8px !important;
          }
          .login-form input, .login-form button {
            font-size: 0.9rem !important;
            padding: 8px !important;
            border-radius: 6px !important;
          }
          button {
            font-size: 0.9rem !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
          }
          h1 {
            font-size: 1.5rem !important;
          }
          p {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
      {errorBanner && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: errorBanner.includes('Password reset email sent') ? '#f0f9ff' : '#fef2f2',
          color: errorBanner.includes('Password reset email sent') ? '#1e40af' : '#dc2626',
          border: errorBanner.includes('Password reset email sent') ? '1px solid #bfdbfe' : '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
          zIndex: 10001,
          maxWidth: '90vw',
          minWidth: '320px',
          fontSize: '0.95rem',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: errorBanner.includes('Password reset email sent') ? '#1e40af' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {errorBanner.includes('Password reset email sent') ? '✓' : '!'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '2px',
              fontSize: '0.9rem'
            }}>
              {errorBanner.includes('Password reset email sent') ? 'Email Sent Successfully' : 'Authentication Error'}
            </div>
            <div style={{ 
              opacity: 0.9,
              fontSize: '0.85rem',
              lineHeight: 1.4
            }}>
              {errorBanner.includes('Password reset email sent') 
                ? 'Check your inbox and follow the instructions to reset your password.'
                : errorBanner.replace('Login failed: ', '').replace('Password reset failed: ', '').replace('Google login failed: ', '')
              }
            </div>
          </div>
        </div>
      )}
      <div style={styles.overlay} />
      <div className="login-card" style={styles.card}>
        <h1 style={styles.heading}>Login</h1>
        <form className="login-form" onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          
          {/* Forgot Password Button */}
          <button
            type="button"
            onClick={handleForgotPassword}
            style={{
              marginTop: '12px',
              background: 'transparent',
              color: '#cccccc',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '500',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'color 0.2s',
              textDecoration: 'underline',
              fontFamily: 'Inter, Helvetica, Arial, sans-serif'
            }}
            disabled={loading}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = '#cccccc'}
          >
            Forgot Password?
          </button>

          {/* Google Login Button below Log In */}
          <button
            onClick={handleGoogleLogin}
            style={{
              marginTop: '18px',
              background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
              color: '#4285F4',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '1.08rem',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 1,
              fontFamily: 'Inter, Helvetica, Arial, sans-serif'
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.03)')}
            onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 24, height: 24 }} />
            Continue with Google
          </button>
        </form>
        <p style={styles.note}>
          Don’t have an account? <a href="/register" style={{...styles.link, color: '#c00', fontWeight: 'bold'}}>Sign up</a>
        </p>
      </div>
    </main>
  );
}

// Keep your styles unchanged
const styles = {
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    zIndex: 0
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
    backgroundColor: '#fff',
    color: '#000',
    padding: '8px 14px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  card: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#0f0f0f',
    padding: '40px 30px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)'
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#ffffff',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif'
  },
  input: {
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
    outline: 'none'
  },
  button: {
    background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
    color: '#000000',
    padding: '12px',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif'
  },
  note: {
    marginTop: '20px',
    color: '#cccccc',
    fontFamily: 'Inter, Helvetica, Arial, sans-serif'
  },
  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};
