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
      {/* PNG overlay above Privacy Policy */}
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
          fontSize: '1.04rem',
          fontWeight: 500,
          color: '#222',
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
          borderRadius: '16px',
          padding: '32px 24px',
          maxWidth: '540px',
          width: '100%',
          height: '620px',
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
        <p style={{ marginBottom: '18px' }}>You can access, update, or delete your data at any time. Contact us at <a href="/contact" style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}>support@dreammotion.com</a>.</p>
        <p style={{ fontWeight: 'bold', color: '#111', fontSize: '1.18em', marginBottom: '18px', marginTop: '32px' }}>📄 Terms of Service</p>
        <p style={{ marginBottom: '18px' }}><b>Effective Date:</b> July 15, 2025</p>
        <p style={{ marginBottom: '18px' }}>Welcome to DreamMotion. By using our website and services, you agree to the following terms:</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Use of Services</p>
        <p style={{ marginBottom: '18px' }}>You may use DreamMotion to generate images and videos for personal or commercial purposes, unless explicitly prohibited. You are responsible for your own content and must not use the platform for illegal, abusive, or exploitative purposes.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. Credits & Payments</p>
        <p style={{ marginBottom: '18px' }}>DreamMotion operates on a credit-based system.<br />You may purchase credits through Stripe.<br />Free credits are offered at signup. All sales are final unless otherwise stated.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. Prohibited Use</p>
        <ul style={{ marginBottom: '18px', paddingLeft: '18px' }}>
          <li>Generate content involving real individuals without their consent.</li>
          <li>Upload or request illegal, harmful, or offensive content.</li>
          <li>Attempt to reverse engineer or misuse the platform’s AI services.</li>
        </ul>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>4. Account Suspension</p>
        <p style={{ marginBottom: '18px' }}>We reserve the right to suspend or terminate accounts that violate these terms or abuse our system.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>5. Liability</p>
        <p style={{ marginBottom: '18px' }}>We provide services "as is" and make no guarantees regarding specific outcomes or uninterrupted access. DreamMotion is not liable for losses resulting from misuse or interruptions.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>6. Changes</p>
        <p>We may update these terms at any time. Continued use implies acceptance of the new terms.</p>
      </div>
    </main>
  );
}
