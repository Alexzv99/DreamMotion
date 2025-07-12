'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactSupportPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);

    // Simulated delay
    setTimeout(() => {
      console.log('Support message submitted:', message);
    }, 1000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundImage: 'url(/background-5.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
      position: 'relative',
      backdropFilter: 'blur(2px)'
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 0
      }} />

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 2,
          backgroundColor: '#fff',
          color: '#000',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '8px 14px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      {/* Support Form Box */}
      <div style={{
        zIndex: 1,
        position: 'relative',
        maxWidth: '600px',
        margin: '100px auto 0 auto',
        backgroundColor: '#fff',
        borderRadius: '24px',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(12px)',
        border: '2px solid',
        borderImage: 'linear-gradient(90deg, #c00 0%, #007bff 100%) 1',
        padding: '48px 40px',
        transition: 'box-shadow 0.3s',
        overflow: 'hidden',
        animation: 'popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)'
      }}>
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.95); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>📩 Contact Support</h2>
        <p style={{ marginBottom: '10px', color: '#555' }}>
          If you're experiencing issues or need help, reach out to our support team anytime.
        </p>
        <p style={{ color: '#c00', fontWeight: 'bold' }}>support@dreammotion.ai</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
            <textarea
              rows="6"
              placeholder="Describe your issue or question here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '10px',
                padding: '12px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
            <button
              type="submit"
              className="creative-btn"
              style={{
                marginTop: '20px',
                fontWeight: 'bold',
                fontSize: '1.18rem',
                padding: '16px 28px',
                borderRadius: '18px',
                letterSpacing: '0.04em',
                boxShadow: '0 0 18px 2px #222, 0 0 8px 2px #444',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🛠️ Send Message
            </button>
            <style>{`
              .creative-btn {
                background: linear-gradient(90deg, #222 0%, #444 100%);
                color: #fff;
                border: none;
                font-family: Inter, Arial, sans-serif;
                font-weight: bold;
                transition: box-shadow 0.3s, transform 0.2s, background 0.3s;
                box-shadow: 0 0 18px 2px #222, 0 0 8px 2px #444;
                position: relative;
                overflow: hidden;
              }
              .creative-btn:hover {
                box-shadow: 0 0 32px 4px #222, 0 0 16px 4px #444;
                transform: scale(1.05);
                background: linear-gradient(90deg, #444 0%, #222 100%);
                filter: brightness(1.08);
              }
            `}</style>
          </form>
        ) : (
          <div style={{
            marginTop: '30px',
            color: 'green',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            ✅ Thank you! Your message has been sent. Our team will get back to you shortly.
          </div>
        )}
      </div>
    </main>
  );
}
