"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
      fontFamily: 'Inter, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#222'
    }}>
      <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: 12 }}>DreamMotion Platform</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: 32, maxWidth: 480, textAlign: 'center' }}>
        Create cinematic AI images and videos with the latest generative models. Choose your tool, upload your file, or enter a prompt to get started!
      </p>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link href="/generate-tool?type=genimage">
          <button style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: 12, background: '#0070f3', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Generate Image
          </button>
        </Link>
        <Link href="/generate-tool?type=image2video">
          <button style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: 12, background: '#22c55e', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Image to Video
          </button>
        </Link>
        <Link href="/generate-tool?type=text2video">
          <button style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: 12, background: '#f59e42', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Text to Video
          </button>
        </Link>
      </div>
      <div style={{ marginTop: 48, fontSize: '1rem', color: '#555' }}>
        <Link href="/dashboard" style={{ textDecoration: 'underline', color: '#0070f3', fontWeight: 500 }}>Go to Dashboard</Link>
      </div>
    </main>
  );
}
