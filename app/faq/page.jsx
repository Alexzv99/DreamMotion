/* FAQ – Frequently Asked Questions
   DreamMotion.ai */
'use client';
import Link from 'next/link';

export default function FAQ() {
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
      {/* Back button top left */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
        <Link href="/dashboard" style={{
          background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textDecoration: 'none',
          display: 'inline-block',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif',
          backdropFilter: 'blur(8px)'
        }}>← Back</Link>
      </div>
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
      <div style={{
        zIndex: 10,
        fontSize: '1.04rem',
        fontWeight: 500,
        color: '#ffffff', // White text
        background: '#0f0f0f', // Dark background like other components
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)', // Enhanced shadow
        borderRadius: '16px',
        padding: '32px 24px',
        maxWidth: '540px',
        fontFamily: "'Inter', sans-serif", // Inter font
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        marginTop: '60px'
      }}>
        <h1 style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '1.4em', marginBottom: '18px', marginTop: 0, letterSpacing: '0.5px' }}>Frequently Asked Questions</h1>
        <ol style={{ paddingLeft: '20px', marginTop: '0' }}>
          <li style={{ marginBottom: '16px' }}>
            <strong>How does the credit system work?</strong><br />
            1 credit = 1 image<br />
            2 credits = 1 second of video<br />
            You receive 10 free credits when signing up. More can be purchased anytime.
          </li>
          <li style={{ marginBottom: '16px' }}>
            <strong>What can I generate?</strong><br />
            AI Images from text prompts<br />
            Cinematic videos from uploaded images<br />
            Full video scenes from text descriptions
          </li>
          <li style={{ marginBottom: '16px' }}>
            <strong>How long does generation take?</strong><br />
            Image generation: 5–15 seconds<br />
            Video generation: Depends on length (usually 30s–90s)
          </li>
          <li style={{ marginBottom: '16px' }}>
            <strong>Is NSFW content allowed?</strong><br />
            Currently, NSFW content is not allowed. We are focused on SFW creative projects only.
          </li>
          <li style={{ marginBottom: '16px' }}>
            <strong>Is my data safe?</strong><br />
            Yes. We use encrypted connections and do not share your personal data with third parties beyond essential services like Stripe.
          </li>
          <li>
            <strong>Need help?</strong><br />
            Contact our support team at <a href="/contact" style={{ color: '#0070f3', textDecoration: 'underline', fontWeight: 'bold' }}>support@dreammotion.com</a>
          </li>
        </ol>
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/dashboard" style={{
          color: '#000000', // Black text
          background: 'linear-gradient(to right, #ffffff, #e0e0e0)', // White gradient like other components
          padding: '12px 32px',
          borderRadius: '12px', // More rounded
          fontWeight: '700', // Bolder
          fontSize: '1rem',
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // Enhanced shadow
          display: 'inline-block',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: "'Inter', sans-serif", // Inter font
          letterSpacing: '0.5px'
        }}>Back to Dashboard</Link>
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
          a {
            font-size: 0.9rem !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
          }
        }
      `}</style>
    </main>
  );
}
