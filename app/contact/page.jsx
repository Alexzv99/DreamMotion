"use client";
import { useRouter } from "next/navigation";

export default function ContactSupportPage() {
  const router = useRouter();
  return (
    <main style={{
      minHeight: '100vh',
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
          opacity: 0.7 // Added opacity to the background video
        }}
        src="/background-video4.mp4"
      />

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
          top: 20,
          left: 20,
          zIndex: 10,
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
          fontFamily: 'Inter, Helvetica, Arial, sans-serif',
          backdropFilter: 'blur(8px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        }}
      >
        ← Back
      </button>

      {/* Support Info Box Only */}
      <div style={{
        zIndex: 1,
        position: "relative",
        maxWidth: "600px",
        margin: "100px auto 0 auto",
        backgroundColor: "#0f0f0f",
        borderRadius: "24px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "48px 40px",
        transition: "box-shadow 0.3s",
        overflow: "hidden",
        animation: "popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)",
        fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      }}>
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.95); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <h2 style={{ fontSize: "2rem", marginBottom: "10px", color: "#ffffff", fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>📩 Contact Support</h2>
        <p style={{ marginBottom: "10px", color: "#cccccc", fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}>
          If you're experiencing issues or need help, reach out to our support team anytime.
        </p>
        <p style={{ color: "#ffffff", fontWeight: "bold", fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}>support@dreammotion.com</p>
      </div>
    </main>
  );
}
