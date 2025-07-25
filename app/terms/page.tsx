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
        <h1 style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '1.4em', marginBottom: '18px', letterSpacing: '0.5px' }}>Terms of Service</h1>
        <p style={{ marginBottom: '18px' }}>Welcome to DreamMotion. By using our platform, you agree to the following terms and conditions:</p>
        <ol style={{ marginBottom: '18px', paddingLeft: '18px' }}>
          <li>
            <strong>Account Responsibilities</strong><br />
            You are responsible for maintaining the confidentiality of your account and password.
          </li>
          <br />
          <li>
            <strong>Prohibited Activities</strong><br />
            You agree not to misuse our platform for illegal or unauthorized purposes.
          </li>
          <br />
          <li>
            <strong>Intellectual Property</strong><br />
            All content on our platform is owned by DreamMotion and protected by copyright laws.
          </li>
          <br />
          <li>
            <strong>Termination</strong><br />
            We reserve the right to suspend or terminate your account for violations of these terms.
          </li>
          <br />
          <li>
            <strong>Limitation of Liability</strong><br />
            DreamMotion is not liable for any indirect, incidental, or consequential damages.
          </li>
          <br />
          <li>
            <strong>Changes to Terms</strong><br />
            We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.
          </li>
        </ol>
        <p>If you have any questions, contact us at <a href="/contact" style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>support@dreammotion.com</a>.</p>
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
          p, ul {
            font-size: 0.9rem !important;
          }
          button {
            font-size: 0.9rem !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
          }
        }
      `}</style>
    </main>
  );
}
