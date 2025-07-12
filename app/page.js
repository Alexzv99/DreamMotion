'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (accepted) {
      setShowBanner(false);
    }
  }, []);

  const handleEnterClick = () => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      setShowBanner(true);
    } else {
      router.push('/dashboard');
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
    router.push('/dashboard');
  };

  const rejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowBanner(false);
    // Stay on the homepage or show a warning — currently just closes
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundImage: 'url("/background-1.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 40px 40px 40px', // reduced top padding from 40px to 20px
      margin: '0',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{ marginTop: '-30px' }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 0
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: '100vh',
          textAlign: 'center'
        }}>

          {/* Logo */}
          <div style={{ marginBottom: '25px' }}>
            <Image src="/logo.png" alt="DreamMotion Logo" width={70} height={70} />
          </div>

          {/* Big Title */}
          <h1 style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 'bold', fontSize: '3.8rem', marginBottom: '20px' }}>
            DreamMotion
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '1.4rem',
            maxWidth: '600px',
            lineHeight: '1.8',
            marginBottom: '50px'
          }}>
            Animate your fantasies.<br />
            Realistic AI-generated motion.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleEnterClick}
            style={{
              padding: '16px 40px',
              borderRadius: '12px',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            Enter Website
          </button>

          {/* Register Link */}
          <p style={{ marginTop: '30px', fontSize: '1rem' }}>
            Not a member yet?{' '}
    <a href="/register" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>
      <span style={{ color: '#c00', fontWeight: 'bold' }}>Register →</span>
            </a>
          </p>
        </div>
      </div>

      {/* Cookie Modal */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#222',
            padding: '30px 40px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '500px',
            color: '#fff',
            boxShadow: '0 0 25px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Cookie Consent</h3>
            <p style={{ marginBottom: '25px', fontSize: '1rem' }}>
              This website uses cookies to enhance user experience.
By clicking &quot;Accept&quot;, you agree to our use of cookies.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={acceptCookies} style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                Accept & Continue
              </button>
              <button onClick={rejectCookies} style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: '#555',
                color: '#fff',
                fontWeight: 'bold',
                border: '1px solid #aaa',
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
