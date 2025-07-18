"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';


export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Google login handler (moved inside component)
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) {
      setErrorMsg('Google registration failed: ' + error.message);
    }
  };

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message.includes('already registered') ? 'User already exists.' : 'Registration failed: ' + error.message);
    } else {
      alert('Check your email to confirm your registration.');
      router.push('/login');
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }}></div>
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
      <div style={{
        zIndex: 1,
        position: 'relative',
        maxWidth: '400px',
        margin: '100px auto 0 auto',
        backgroundColor: '#fff',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 0 25px rgba(0,0,0,0.3)',
        padding: '25px',
      }}>
        {errorMsg && (
          <div style={{
            background: '#ff3b3b',
            color: 'white',
            padding: '16px 24px',
            fontWeight: 'bold',
            textAlign: 'center',
            borderRadius: '12px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
            minWidth: '260px',
            fontSize: '1.2rem',
            marginBottom: '18px',
          }}>
            {errorMsg}
          </div>
        )}
        <h1 style={{ fontSize: '2rem', marginBottom: '30px', color: '#222', fontWeight: 'bold' }}>Create Your Account</h1>
        <form onSubmit={handleSubmit} style={{
          background: 'none',
          color: '#000',
          borderRadius: '12px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#1b1b1b',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            Register
          </button>
          <button
            type="button"
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
            Sign up with Google
          </button>
          <Link href="/login" style={{
            marginTop: '12px',
            color: '#c00',
            textAlign: 'center',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            ← Back to login
          </Link>
          <Link href="/dashboard" style={{
            marginTop: '6px',
            color: '#c00',
            textAlign: 'center',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            → Go to Dashboard
          </Link>
        </form>
      </div>
      <style>{`
        @media (max-width: 480px) {
          main {
            padding: 20px !important;
          }
          div {
            max-width: 90vw !important;
            padding: 16px 1vw !important;
            border-radius: 8px !important;
          }
          h1 {
            font-size: 1.5rem !important;
          }
          input, button {
            font-size: 0.9rem !important;
            padding: 8px !important;
            border-radius: 6px !important;
          }
          button {
            font-size: 0.9rem !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
          }
        }
      `}</style>
    </main>
  );
}

