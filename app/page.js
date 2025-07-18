"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showCookieBar, setShowCookieBar] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  // Auto-hide error banner after 3 seconds
  React.useEffect(() => {
    if (errorBanner) {
      const timer = setTimeout(() => setErrorBanner(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorBanner]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', width: '100vw', overflow: 'hidden' }}>
      {/* Footer */}
      <footer style={{
        width: '100vw',
        textAlign: 'center',
        padding: '18px 0 12px 0',
        color: '#eee',
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        zIndex: 4,
        background: 'rgba(0,0,0,0.15)'
      }}>
        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#ccc' }}>
          © 2025 DreamMotion. All rights reserved.
        </div>
      </footer>

      {/* Animated video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        src="/background-video.mp4"
      />
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
      {/* Cookie modal blocks all content until accepted */}
      {showCookieBar && !cookiesAccepted ? (
        <div style={{
          position: 'fixed',
          left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          pointerEvents: 'auto'
        }}>
          <div style={{
            background: '#222',
            padding: 32,
            borderRadius: 12,
            color: 'white',
            textAlign: 'center',
            minWidth: 320,
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            pointerEvents: 'auto'
          }}>
            <p style={{ marginBottom: 16, fontSize: 18 }}>
              This website uses cookies to <strong>enhance the user experience</strong>.<br />
              You must accept cookies to continue.
            </p>
            <button
              onClick={() => {
                setCookiesAccepted(true);
                setShowCookieBar(false);
                if (showCookieBar === 'register') {
                  window.location.href = '/register';
                } else {
                  window.location.href = '/dashboard';
                }
              }}
              style={{
                margin: '0 8px',
                padding: '10px 22px',
                fontSize: 15,
                border: 'none',
                backgroundColor: '#fff',
                color: '#222',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Accept Cookies
            </button>
            <button
              onClick={() => {
                setCookiesAccepted(false);
                setShowCookieBar(true);
                window.location.href = '/';
              }}
              style={{
                margin: '0 8px',
                padding: '10px 22px',
                fontSize: 15,
                border: 'none',
                backgroundColor: '#ff3b3b',
                color: '#fff',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Decline
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Overlay */}
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />
          {/* Centered Content */}
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            zIndex: 2,
            pointerEvents: 'auto',
          }}>
            <h1 style={{ fontSize: 60, marginBottom: 20, fontWeight: 700 }}>DreamMotion</h1>
            <div style={{ fontSize: 15, fontWeight: 400, marginBottom: 28, lineHeight: 1.3, color: '#b0b0b0' }}>
              <span style={{ fontSize: 20 }}>
                The fastest way to create AI-powered images & videos<br />
                Bring your creative ideas to life with cinematic motion
              </span>
              <div style={{ color: '#c00', fontWeight: 'bold', fontSize: '1.15rem', marginTop: '14px' }}>
                Upload an image. Get a cinematic video in seconds.<br />
                No experience needed. Just create.
              </div>
            </div>
            <button
              style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '15px 30px',
                fontSize: 18,
                border: 'none',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'background-color 0.3s',
                display: 'inline-block',
                marginBottom: 10,
                cursor: 'pointer'
              }}
              onClick={() => {
                setShowCookieBar(true);
              }}
            >
              Enter
            </button>
            <div style={{ marginTop: 12 }}>
              <span
                style={{ fontSize: 17, fontWeight: 500, cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  setShowCookieBar('register');
                }}
              >
                <span style={{ color: '#fff' }}>Not a member yet? </span>
                <span style={{ color: '#ff3b3b', textDecoration: 'underline' }}>Register</span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
