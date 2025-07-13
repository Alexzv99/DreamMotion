'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCookies, setShowCookies] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message.includes('already registered') ? 'User already exists.' : 'Registration failed: ' + error.message);
    } else {
      alert("Check your email to confirm your registration.");
      router.push('/login');
    }
  };

  const handleAcceptCookies = () => {
    setShowCookies(false);
  };

  const handleRejectCookies = () => {
    setShowCookies(false);
    alert('Cookies rejected.');
  };

  return (
    <main style={{
      minHeight: '100vh',
          backgroundImage: 'url("/background-2.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }} />

      <button
        onClick={() => router.back()}
        style={{
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
        }}
      >
        ← Back
      </button>


      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {errorMsg && (
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
            zIndex: 1000,
            borderRadius: '12px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
            minWidth: '260px',
            fontSize: '1.2rem'
          }}>
            {errorMsg}
          </div>
        )}
        <h1 style={{ fontSize: '2rem', marginBottom: '30px', color: '#fff', fontWeight: 'bold' }}>Create Your Account</h1>

        <form onSubmit={handleSubmit} style={{
          background: '#fff',
          color: '#000',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 0 25px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px',
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
            {loading ? 'Registering...' : '📝 Register'}
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
    </main>
  );
}
