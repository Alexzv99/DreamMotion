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
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('video4'); // Fixed background
  const router = useRouter();

  // Load saved background preference from localStorage
  useEffect(() => {
    // Always use video4 background
    setSelectedBackground('video4');
  }, []);

  // Google login handler (moved inside component)
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
      setErrorMsg('Google registration failed: ' + error.message);
      console.error('Google registration error:', error);
    }
  };

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        router.push('/login');
      }, 2000); // Show success message for 2 seconds, then redirect
      return () => clearTimeout(timer);
    }
  }, [successMsg, router]);

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
      setSuccessMsg('Registration successful! Redirecting to login...');
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
        key={selectedBackground} // Force re-render when background changes
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
      <div style={{
        zIndex: 1,
        position: 'relative',
        maxWidth: '400px',
        margin: '100px auto 0 auto',
        backgroundColor: '#0f0f0f',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
        padding: '25px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif'
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
        {successMsg && (
          <div style={{
            background: '#22c55e',
            color: 'white',
            padding: '16px 24px',
            fontWeight: 'bold',
            textAlign: 'center',
            borderRadius: '12px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
            minWidth: '260px',
            fontSize: '1.2rem',
            marginBottom: '18px',
            animation: 'fadeIn 0.3s ease-in-out',
          }}>
            ✅ {successMsg}
          </div>
        )}
        <h1 style={{ fontSize: '2rem', marginBottom: '30px', color: '#ffffff', fontWeight: 'bold', fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}>Create Your Account</h1>
        <form onSubmit={handleSubmit} style={{
          background: 'none',
          color: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif'
        }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '1rem',
              fontFamily: 'Inter, Helvetica, Arial, sans-serif',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '1rem',
              fontFamily: 'Inter, Helvetica, Arial, sans-serif',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '1rem',
              fontFamily: 'Inter, Helvetica, Arial, sans-serif',
              outline: 'none'
            }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
            color: '#000000',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, Helvetica, Arial, sans-serif',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            transform: loading ? 'scale(0.98)' : 'scale(1)'
          }}
          onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.03)')}
          onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          
          <button
            type="button"
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
            Sign up with Google
          </button>
          <Link href="/login" style={{
            marginTop: '12px',
            color: '#ffffff',
            textAlign: 'center',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontFamily: 'Inter, Helvetica, Arial, sans-serif'
          }}>
            ← Back to login
          </Link>
          <Link href="/dashboard" style={{
            marginTop: '6px',
            color: '#cccccc',
            textAlign: 'center',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontFamily: 'Inter, Helvetica, Arial, sans-serif'
          }}>
            → Go to Dashboard
          </Link>
        </form>
      </div>
      {/* Video Background for Mobile */}
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
      }}></div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
          video {
            object-fit: cover !important;
          }
          div {
            background: rgba(0, 0, 0, 0.6) !important;
          }
        }
      `}</style>
    </main>
  );
}

