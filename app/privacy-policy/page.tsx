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
        src="/background-video4.mp4"
      />

      {/* Dark overlay to match dashboard */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)', // Dark gradient
          color: '#ffffff', // White text
          border: '1px solid rgba(255, 255, 255, 0.2)', // Subtle white border
          borderRadius: '12px', // More rounded
          padding: '12px 20px', // Better padding
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // Enhanced shadow
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: "'Inter', sans-serif", // Inter font
          backdropFilter: 'blur(8px)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        }}
      >
        ← Back
      </button>

      {/* Content */}
      <div
        style={{
          zIndex: 10,
          fontSize: '1rem', // Reduced font size for a smaller appearance
          fontWeight: 500,
          color: '#ffffff', // White text
          background: '#0f0f0f', // Dark background like other components
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)', // Enhanced shadow
          borderRadius: '16px', // More rounded corners
          padding: '32px 24px', // Better padding
          maxWidth: '540px', // Slightly larger for better readability
          width: '100%',
          height: '520px', // Reduced height
          margin: '0 auto',
          position: 'relative',
          marginTop: '60px',
          overflowY: 'auto',
          fontFamily: "'Inter', sans-serif", // Inter font
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)' // Subtle border
        }}
      >
        <div>
          <h1 style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '1.4em', marginBottom: '18px', letterSpacing: '0.5px' }}>Privacy Policy</h1>
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
              You can access, update, or delete your data at any time. Contact us at <a href="/contact" style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>support@dreammotion.com</a>.
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
