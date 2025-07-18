"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const router = useRouter();
  // Google login handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) {
      setErrorBanner('Google login failed: ' + error.message);
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
      >
        <source src="/background-video1.mp4" type="video/mp4" />
      </video>
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: '#fff',
          color: '#111',
          border: '2px solid #222',
          borderRadius: '10px',
          padding: '10px 18px',
          fontWeight: 'bold',
          fontSize: '1.08rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          cursor: 'pointer',
          transition: 'background 0.2s',
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
      `}</style>
      {errorBanner && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ff3b3b',
          color: 'white',
          padding: '24px 32px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 10001,
          borderRadius: '12px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
          minWidth: '260px',
          fontSize: '1.2rem'
        }}>
          {errorBanner}
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
          {/* Google Login Button below Log In */}
          <button
            onClick={handleGoogleLogin}
            style={{
              marginTop: '18px',
              background: '#fff',
              color: '#4285F4',
              border: '2px solid #4285F4',
              borderRadius: '10px',
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '1.08rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 1
            }}
            disabled={loading}
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
    backgroundColor: '#fff',
    padding: '40px 30px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(0,0,0,0.3)'
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#111'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    color: '#000'
  },
  button: {
    backgroundColor: '#111',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  note: {
    marginTop: '20px',
    color: '#444'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};
