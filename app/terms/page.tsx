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
        <h1 style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px' }}>Terms of Service</h1>
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
        <p>If you have any questions, contact us at <a href="mailto:support@dreammotion.com">support@dreammotion.com</a>.</p>
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
