'use client';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <main
      style={{
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
      }}
    >
      {/* Background Video */}
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
        src="/background-video2.mp4"
      />

      {/* Back Button */}
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

      {/* Content */}
      <div
        style={{
          zIndex: 3,
          fontSize: '1rem', // Reduced font size for a smaller appearance
          fontWeight: 500,
          color: '#222',
          background: 'rgba(255,255,255,0.85)', // Adjusted opacity to match other pages
          boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
          borderRadius: '12px', // Reduced border radius for a smaller box
          padding: '24px 20px', // Reduced padding
          maxWidth: '480px', // Reduced max width
          width: '100%',
          height: '520px', // Reduced height
          margin: '0 auto',
          position: 'relative',
          marginTop: '60px',
          overflowY: 'auto',
        }}
      >
        <p style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px' }}>📄 Terms of Service</p>
        <p style={{ marginBottom: '18px' }}><b>Effective Date:</b> July 15, 2025</p>
        <p style={{ marginBottom: '18px' }}>Welcome to DreamMotion. By using our website and services, you agree to the following terms:</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Use of Services</p>
        <p style={{ marginBottom: '18px' }}>You may use DreamMotion to generate images and videos for personal or commercial purposes, unless explicitly prohibited. You are responsible for your own content and must not use the platform for illegal, abusive, or exploitative purposes.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. Credits & Payments</p>
        <ul style={{ marginBottom: '18px', paddingLeft: '18px' }}>
          <li>DreamMotion operates on a credit-based system.</li>
          <li>You may purchase credits through Stripe.</li>
          <li>Free credits are offered at signup. All sales are final unless otherwise stated.</li>
        </ul>
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
        <p style={{ marginBottom: '18px' }}>We may update these terms at any time. Continued use implies acceptance of the new terms.</p>
      </div>
    </main>
  );
}
