'use client';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'url("/abstract-bg.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        color: '#222',
        padding: '0',
        margin: '0',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(2px)'
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          zIndex: 0,
        }}
      />

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
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      {/* Content */}
      <div
        style={{
          zIndex: 1,
          position: 'relative',
          maxWidth: '800px',
          margin: '120px auto 0 auto',
          backgroundColor: 'rgba(255,255,255,0.09)',
          padding: '40px',
          borderRadius: '18px',
          backdropFilter: 'blur(5px)',
        }}
      >
        <h1
          style={{
            fontSize: '2.4rem',
            marginBottom: '20px',
            color: '#fff',
          }}
        >
          Terms and Services
        </h1>

        <p
          style={{
            marginBottom: '20px',
            lineHeight: 1.6,
            fontSize: '1.1rem',
            color: '#ddd',
          }}
        >
          By accessing and using DreamMotion, you agree to abide by our terms and services. These include your responsibilities as a user, our content policies, payment and subscription rules, and more.
          <br /><br />
          • You must not upload or attempt to generate content that violates any law or platform rule.
          <br />
          • Subscriptions renew automatically unless cancelled at least 24 hours before renewal time.
          <br />
          • DreamMotion reserves the right to suspend accounts that misuse the platform.
        </p>

        <p
          style={{
            color: '#999',
            fontSize: '0.9rem',
          }}
        >
          For full legal terms, please contact us at <strong>support@dreammotion.ai</strong>.
        </p>
      </div>
    </main>
  );
}
