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
        <h1 style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px', marginTop: 0 }}>Frequently Asked Questions</h1>
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
            Contact our support team at <a href="mailto:support@dreammotion.com" style={{ color: '#0070f3', textDecoration: 'underline' }}>support@dreammotion.com</a>
          </li>
        </ol>
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/dashboard" style={{
          color: '#fff',
          background: '#111',
          padding: '12px 32px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.9em',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'inline-block',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s'
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
