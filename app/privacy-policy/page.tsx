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
        <div>
          <h1 style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px' }}>Privacy Policy</h1>
          <p style={{ marginBottom: '18px' }}><strong>Effective Date:</strong> July 15, 2025</p>
          <p style={{ marginBottom: '18px' }}>At DreamMotion, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
          <ol style={{ marginBottom: '18px', paddingLeft: '18px' }}>
            <li>
              <strong>Information We Collect</strong><br />
              Account Details: Name, email address, and login data.<br />
              Usage Data: How you interact with our platform (e.g., tools used, number of generations, credits spent).<br />
              Device Info: Browser type, IP address, and device information.
            </li>
            <br />
            <li>
              <strong>How We Use Your Information</strong><br />
              To provide and improve our services.<br />
              To manage your account and credits.<br />
              To send transactional and promotional emails (opt-out anytime).<br />
              For analytics and security purposes.
            </li>
            <br />
            <li>
              <strong>Sharing Your Information</strong><br />
              We do not sell or share your personal information with third parties, except:<br />
              With service providers (e.g., payment processors like Stripe).<br />
              To comply with legal obligations.
            </li>
            <br />
            <li>
              <strong>Cookies</strong><br />
              We use cookies to improve user experience. You can control cookie preferences in your browser settings.
            </li>
            <br />
            <li>
              <strong>Data Security</strong><br />
              We use industry-standard encryption and security protocols to protect your data.
            </li>
            <br />
            <li>
              <strong>Your Rights</strong><br />
              You can access, update, or delete your data at any time. Contact us at <a href="mailto:support@dreammotion.com" style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>support@dreammotion.com</a>.
            </li>
          </ol>
        </div>

        <style>{`
          @media (max-width: 480px) {
            main {
              padding: 20px !important;
            }
            div {
              max-width: 90vw !important;
              padding: 16px 1vw !important;
              border-radius: 8px !important;
            }
            p {
              font-size: 0.9rem !important;
            }
            button {
              font-size: 0.9rem !important;
              padding: 8px 12px !important;
              border-radius: 6px !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
