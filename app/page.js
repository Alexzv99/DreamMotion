"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showCookieBar, setShowCookieBar] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check sessionStorage for cookie preference on component mount (session-based, not permanent)
  useEffect(() => {
    const savedCookiePreference = sessionStorage.getItem('cookiesAccepted');
    console.log('Saved cookie preference:', savedCookiePreference); // Debug log
    
    if (savedCookiePreference === 'true') {
      setCookiesAccepted(true);
      setShowCookieBar(false);
    } else if (savedCookiePreference === 'false') {
      setCookiesAccepted(false);
      setShowCookieBar(false);
    } else {
      // No preference saved for this session - this is a new user/session
      setCookiesAccepted(false);
      setShowCookieBar(false); // Will show when they click Enter/Register
    }
    setIsInitialized(true);
  }, []);
  
  // Auto-hide error banner after 3 seconds
  useEffect(() => {
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
        background: 'rgba(0,0,0,0.15)',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ 
          marginTop: '12px', 
          fontSize: '0.9rem', 
          color: '#ccc',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif'
        }}>
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
        src="/background-video4.mp4"
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
      {/* Professional Cookie Banner - Centered White Design */}
      {showCookieBar ? (
        <>
          {/* Dark overlay for cookie banner */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10000,
            pointerEvents: 'none'
          }} />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '24px 28px',
          zIndex: 10001,
          width: '520px',
          maxWidth: '90vw',
          fontSize: '0.95rem',
          fontWeight: '500',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ℹ
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '6px',
              fontSize: '1rem',
              color: '#000000'
            }}>
              Cookie Preferences
            </div>
            <div style={{ 
              opacity: 0.8,
              fontSize: '0.87rem',
              lineHeight: 1.4,
              marginBottom: '16px',
              color: '#333333'
            }}>
              We use cookies to enhance your experience on DreamMotion and provide personalized content.
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  setCookiesAccepted(true);
                  setShowCookieBar(false);
                  sessionStorage.setItem('cookiesAccepted', 'true');
                  if (showCookieBar === 'register') {
                    window.location.href = '/register';
                  } else {
                    window.location.href = '/dashboard';
                  }
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#333333'}
                onMouseOut={(e) => e.target.style.background = '#000000'}
              >
                Accept All
              </button>
              <button
                onClick={() => {
                  setCookiesAccepted(false);
                  setShowCookieBar(false);
                  sessionStorage.setItem('cookiesAccepted', 'false');
                  window.location.href = '/';
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border: '2px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#999999';
                  e.target.style.backgroundColor = '#f8f8f8';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#cccccc';
                  e.target.style.backgroundColor = '#ffffff';
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
        </>
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
            fontFamily: 'Inter, Helvetica, Arial, sans-serif',
            zIndex: 2,
            pointerEvents: 'auto',
          }}>
            <h1 style={{ 
              fontSize: 60, 
              marginBottom: 20, 
              fontWeight: 700,
              fontFamily: 'Inter, Helvetica, Arial, sans-serif'
            }}>DreamMotion</h1>
            <div style={{ 
              fontSize: 15, 
              fontWeight: 400, 
              marginBottom: 28, 
              lineHeight: 1.3, 
              color: '#b0b0b0',
              fontFamily: 'Inter, Helvetica, Arial, sans-serif'
            }}>
              <span style={{ fontSize: 20 }}>
                The fastest way to create AI-powered images & videos<br />
                Bring your creative ideas to life with cinematic motion
              </span>
              <div style={{ 
                color: '#c00', 
                fontWeight: 'bold', 
                fontSize: '1.15rem', 
                marginTop: '14px',
                fontFamily: 'Inter, Helvetica, Arial, sans-serif'
              }}>
                Upload an image. Get a cinematic video in seconds.<br />
                No experience needed. Just create.
              </div>
            </div>
            <button
              style={{
                background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                color: '#000000',
                padding: '15px 30px',
                fontSize: 18,
                border: 'none',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                marginBottom: 10,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                fontFamily: 'Inter, Helvetica, Arial, sans-serif'
              }}
              onClick={() => {
                const savedCookiePreference = sessionStorage.getItem('cookiesAccepted');
                console.log('Enter clicked, sessionStorage value:', savedCookiePreference);
                
                if (savedCookiePreference === 'true') {
                  console.log('Going directly to dashboard');
                  window.location.href = '/dashboard';
                } else {
                  console.log('Showing cookie banner');
                  setShowCookieBar(true);
                }
              }}
            >
              Enter
            </button>
            <div style={{ marginTop: 12 }}>
              <span
                style={{ 
                  fontSize: 17, 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontFamily: 'Inter, Helvetica, Arial, sans-serif'
                }}
                onClick={e => {
                  e.preventDefault();
                  // Only check sessionStorage if component is initialized
                  if (!isInitialized) return;
                  
                  const savedCookiePreference = sessionStorage.getItem('cookiesAccepted');
                  console.log('Register clicked, cookie preference:', savedCookiePreference);
                  
                  if (savedCookiePreference === 'true') {
                    // Cookies already accepted this session, go directly to register
                    window.location.href = '/register';
                  } else {
                    // No choice made this session - show cookie banner
                    setShowCookieBar('register');
                  }
                }}
              >
                <span style={{ color: '#fff' }}>Not a member yet? </span>
                <span style={{ 
                  color: '#ff3b3b', 
                  textDecoration: 'underline',
                  fontFamily: 'Inter, Helvetica, Arial, sans-serif'
                }}>Register</span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
