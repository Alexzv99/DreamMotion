'use client';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
        <p style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px' }}>🔒 Privacy Policy</p>
        <p style={{ marginBottom: '18px' }}><b>Effective Date:</b> July 15, 2025</p>
        <p style={{ marginBottom: '18px' }}>At DreamMotion, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Information We Collect</p>
        <ul style={{ marginBottom: '18px', paddingLeft: '18px' }}>
          <li>Account Details: Name, email address, and login data.</li>
          <li>Usage Data: How you interact with our platform (e.g., tools used, number of generations, credits spent).</li>
          <li>Device Info: Browser type, IP address, and device information.</li>
        </ul>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. How We Use Your Information</p>
        <ul style={{ marginBottom: '18px', paddingLeft: '18px' }}>
          <li>To provide and improve our services.</li>
          <li>To manage your account and credits.</li>
          <li>To send transactional and promotional emails (opt-out anytime).</li>
          <li>For analytics and security purposes.</li>
        </ul>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. Sharing Your Information</p>
        <ul style={{ marginBottom: '18px', paddingLeft: '18px' }}>
          <li>We do not sell or share your personal information with third parties, except:</li>
          <li>With service providers (e.g., payment processors like Stripe).</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>4. Cookies</p>
        <p style={{ marginBottom: '18px' }}>We use cookies to improve user experience. You can control cookie preferences in your browser settings.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>5. Data Security</p>
        <p style={{ marginBottom: '18px' }}>We use industry-standard encryption and security protocols to protect your data.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>6. Your Rights</p>
        <p style={{ marginBottom: '18px' }}>You can access, update, or delete your data at any time. Contact us at <a href="mailto:support@dreammotion.com" style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>support@dreammotion.com</a>.</p>
      </div>
    </main>
  );
}
