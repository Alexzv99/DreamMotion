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
      {/* PNG overlay above FAQ */}
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
        <p style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px' }}>Frequently Asked Questions</p>

        <p><b>🔋 How does the credit system work?</b><br />
        1 credit = 1 image<br />
        2 credits = 1 second of video<br />
        You receive 10 free credits when signing up. More can be purchased anytime.</p>

        <p><b>🎥 What can I generate?</b><br />
        AI Images from text prompts<br />
        Cinematic videos from uploaded images<br />
        Full video scenes from text descriptions</p>

        <p><b>⏳ How long does generation take?</b><br />
        Image generation: 5–15 seconds<br />
        Video generation: Depends on length (usually 30s–90s)</p>

        <p><b>🚫 Is NSFW content allowed?</b><br />
        Currently, NSFW content is not allowed. We are focused on SFW creative projects only.</p>

        <p><b>🔐 Is my data safe?</b><br />
        Yes. We use encrypted connections and do not share your personal data with third parties beyond essential services like Stripe.</p>

        <p><b>🆘 Need help?</b><br />
        Contact our support team at <Link href="/contact" style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>support@dreammotion.com</Link></p>
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
    </main>
  );
}
