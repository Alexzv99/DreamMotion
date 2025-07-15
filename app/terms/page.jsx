/* Terms of Service – DreamMotion */
'use client';
import Link from 'next/link';

export default function Terms() {
  return (
    <main style={{
      minHeight: '100vh',
      width: '100vw',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      background: '#f7f7f7',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
      fontSize: '0.7em'
    }}>
      <div style={{ position: 'relative', width: '100vw', minHeight: '100vh' }}>
        {/* Back button top left */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
          <Link href="/dashboard" style={{
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
            textDecoration: 'none',
            display: 'inline-block'
          }}>← Back</Link>
        </div>
        {/* PNG overlay above Terms */}
        <img
          src="/background-5.png"
          alt="Background Overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        <div style={{
          zIndex: 3,
          fontSize: '1.04rem',
          fontWeight: 500,
          color: '#222',
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
          borderRadius: '16px',
          padding: '32px 24px',
          maxWidth: '540px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          marginTop: '60px'
        }}>
          <p style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px' }}>📄 Terms of Service</p>
          <p style={{ marginBottom: '18px' }}><b>Effective Date:</b> July 15, 2025</p>
          <p style={{ marginBottom: '18px' }}>Welcome to DreamMotion. By using our website and services, you agree to the following terms:</p>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Use of Services</p>
          <p style={{ marginBottom: '18px' }}>You may use DreamMotion to generate images and videos for personal or commercial purposes, unless explicitly prohibited. You are responsible for your own content and must not use the platform for illegal, abusive, or exploitative purposes.</p>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. Credits & Payments</p>
          <p style={{ marginBottom: '18px' }}>DreamMotion operates on a credit-based system.<br />You may purchase credits through Stripe.<br />Free credits are offered at signup. All sales are final unless otherwise stated.</p>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. Prohibited Use</p>
          <ul style={{ marginBottom: '18px', paddingLeft: '18px' }}>
            <li>Generate content involving real individuals without their consent.</li>
            <li>Upload or request illegal, harmful, or offensive content.</li>
            <li>Attempt to reverse engineer or misuse the platform’s AI services.</li>
          </ul>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>4. Account Suspension</p>
          <p style={{ marginBottom: '18px' }}>We reserve the right to suspend or terminate accounts that violate these terms or abuse our system.</p>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>5. Liability</p>
          <p style={{ marginBottom: '18px' }}>We provide services "as is" and make no guarantees regarding specific outcomes or uninterrupted access. DreamMotion is not liable for losses resulting from misuse or interruptions.</p>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>6. Changes</p>
          <p>We may update these terms at any time. Continued use implies acceptance of the new terms.</p>
        </div>
      </div>
    </main>
  );
}
