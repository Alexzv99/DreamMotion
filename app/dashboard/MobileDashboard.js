import { useState } from 'react';
import Link from 'next/link';

export default function MobileDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main style={{
      minHeight: '100vh',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '20px',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: '#f7f7f7',
      position: 'relative',
    }}>
      {/* Hamburger Menu */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
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
        ☰
      </button>

      {menuOpen && (
        <nav style={{
          position: 'absolute',
          top: 60,
          left: 20,
          background: '#fff',
          border: '2px solid #222',
          borderRadius: '10px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          zIndex: 1000,
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '10px' }}><Link href="/">Home</Link></li>
            <li style={{ marginBottom: '10px' }}><Link href="/dashboard">Dashboard</Link></li>
            <li style={{ marginBottom: '10px' }}><Link href="/subscribe">Subscribe</Link></li>
            <li style={{ marginBottom: '10px' }}><Link href="/contact">Contact</Link></li>
            <li style={{ marginBottom: '10px' }}><Link href="/faq">FAQ</Link></li>
            <li style={{ marginBottom: '10px' }}><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li style={{ marginBottom: '10px' }}><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/login">Login</Link></li>
          </ul>
        </nav>
      )}

      <h1 style={{ fontSize: '1.5rem', marginTop: '100px' }}>Mobile Dashboard</h1>
      <section style={{
        marginTop: '20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{
          width: '90%',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          textAlign: 'center',
        }}>
          <h2>Tool 1</h2>
          <p>Description of Tool 1</p>
        </div>
        <div style={{
          width: '90%',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          textAlign: 'center',
        }}>
          <h2>Tool 2</h2>
          <p>Description of Tool 2</p>
        </div>
        {/* Add more tools or sections as needed */}
      </section>
    </main>
  );
}
