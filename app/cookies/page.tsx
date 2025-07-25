"use client";
import { useRouter } from 'next/navigation';

export default function CookiesPage() {
  const router = useRouter();
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif'
    }}>
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/background-video4.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }} />

      <div
        style={{
          zIndex: 2,
          position: 'relative',
          maxWidth: '800px',
          margin: '120px auto',
          background: '#0f0f0f', // Dark background like other components
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '16px', // More rounded
          color: '#ffffff', // White text
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)', // Enhanced shadow
          fontFamily: "'Inter', sans-serif", // Inter font
          border: '1px solid rgba(255, 255, 255, 0.1)' // Subtle border
        }}
      >
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
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
      <h1 style={{ fontSize: '2.4rem', marginBottom: '20px' }}>Cookie Policy</h1>
      <p
        style={{
          lineHeight: 1.6,
          fontSize: '1.1rem',
          marginBottom: '20px',
          color: '#666',
        }}
      >
        We use cookies and similar technologies to improve your experience on DreamMotion,
        analyze traffic, and personalize content. By continuing to use our website, you
        agree to the use of cookies in accordance with this policy.
      </p>
      <p
        style={{
          lineHeight: 1.6,
          fontSize: '1.1rem',
          color: '#666',
        }}
      >
        You can choose to disable cookies in your browser settings. However, disabling cookies
        may affect the functionality of the site. For more information about how we use and manage cookies, 
        please review our Terms of Service and Privacy Policy.
      </p>
      </div>
    </div>
  );
}
