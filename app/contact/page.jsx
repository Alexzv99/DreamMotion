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
        src="/background-video1.mp4"
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

      {/* Support Info Box Only */}
      <div style={{
        zIndex: 1,
        position: "relative",
        maxWidth: "600px",
        margin: "100px auto 0 auto",
        backgroundColor: "#fff",
        borderRadius: "24px",
        textAlign: "center",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        backdropFilter: "blur(12px)",
        border: "2px solid",
        borderImage: "linear-gradient(90deg, #c00 0%, #007bff 100%) 1",
        padding: "48px 40px",
        transition: "box-shadow 0.3s",
        overflow: "hidden",
        animation: "popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)"
      }}>
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.95); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>📩 Contact Support</h2>
        <p style={{ marginBottom: "10px", color: "#555" }}>
          If you're experiencing issues or need help, reach out to our support team anytime.
        </p>
        <p style={{ color: "#c00", fontWeight: "bold" }}>support@dreammotion.com</p>
      </div>
    </main>
  );
}
