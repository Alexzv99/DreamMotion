"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  return (
    <div
      style={{
        backgroundImage: "url('/background-4.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1
      }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <h1 style={{ fontSize: 60, marginBottom: 20, fontWeight: 700 }}>DreamMotion</h1>
        <Link href="/dashboard">
          <a style={{
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
            marginBottom: 10
          }}>Enter</a>
        </Link>
      </div>
      {/* Cookie bar */}
      {!cookiesAccepted && (
        <div style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 15,
          borderRadius: 8,
          color: 'white',
          textAlign: 'center',
          zIndex: 100
        }}>
          <p style={{ marginBottom: 8, fontSize: 16 }}>
            This website uses cookies to <strong>enhance the user experience</strong>.
          </p>
          <button
            onClick={() => setCookiesAccepted(true)}
            style={{
              marginTop: 10,
              padding: '8px 16px',
              fontSize: 14,
              border: 'none',
              backgroundColor: 'white',
              color: 'black',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Accept Cookies
          </button>
        </div>
      )}
    </div>
  );
}
