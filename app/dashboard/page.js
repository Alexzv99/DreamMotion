/* eslint-disable react/no-unescaped-entities */
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

const MobileDashboard = dynamic(() => import('./MobileDashboard'));

export default function Dashboard() {
  const [credits, setCredits] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setCredits(null);
        return;
      }

      setUserId(user.id);

      let { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ id: user.id, email: user.email, credits: 10 }]);

        if (!insertError) {
          setCredits(10);
        } else {
          console.error('Insert failed:', insertError.message);
        }
      } else if (data) {
        setCredits(data.credits);
      }
    };

    fetchUserCredits();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setCredits(null);
    // No redirect — stay on dashboard
  };

  if (isMobile) {
    return <MobileDashboard />;
  }

  return (
    <main style={{
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backdropFilter: 'blur(2px)',
      position: 'relative'
    }}>
      {/* Video Background for Mobile */}
      <video
        autoPlay
        loop
        muted
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
        <source src="/background-video1.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }}></div>
      <style>{`
        @media (max-width: 480px) {
          video {
            object-fit: cover !important;
          }
          div {
            background: rgba(0, 0, 0, 0.6) !important;
          }
        }
      `}</style>
      <style>{`
        @media (max-width: 900px) {
          .dashboard-container {
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .tools-grid {
            flex-direction: column !important;
            gap: 18px !important;
            max-width: 100vw !important;
            padding: 0 2vw !important;
          }
          .tools-row {
            flex-direction: column !important;
            gap: 18px !important;
            align-items: stretch !important;
            padding: 0 !important;
          }
          .tool-box, .help-box {
            max-width: 98vw !important;
            padding: 18px 2vw !important;
            font-size: 1rem !important;
            border-radius: 10px !important;
          }
          .dashboard-navbar {
            flex-direction: column !important;
            gap: 12px !important;
            font-size: 1.1rem !important;
          }
        }
        @media (max-width: 600px) {
          .tool-box, .help-box {
            padding: 12px 1vw !important;
            font-size: 0.98rem !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-container {
            padding: 16px 1vw !important;
          }
          .tools-grid {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .tools-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .tool-box, .help-box {
            max-width: 90vw !important;
            padding: 12px 1vw !important;
            font-size: 0.9rem !important;
            border-radius: 8px !important;
          }
          .tool-box img, .tool-box video {
            display: block;
            margin: 12px auto 0 auto;
            max-width: 100%;
            height: auto;
          }
          .dashboard-navbar {
            flex-direction: column !important;
            gap: 10px !important;
            font-size: 1rem !important;
          }
          h1 {
            font-size: 1.5rem !important;
          }
          button, a {
            font-size: 0.9rem !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
          }
        }
      `}</style>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1
      }} />
      {/* All content below should have zIndex: 2 or higher if needed */}

      <div className="dashboard-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <nav className="dashboard-navbar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          color: '#fff'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>DreamMotion</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/" style={navLink}>Home</Link>
            <Link href="/dashboard" style={navLink}>Dashboard</Link>
            <Link href="/subscribe" style={navLink}>Subscribe</Link>
            <Link href="/contact" style={navLink}>Contact</Link>
            {userId ? (
              <button onClick={handleLogout} style={navButton}>Logout</button>
            ) : (
              <Link href="/login" style={navLink}>Login</Link>
            )}
          </div>
        </nav>

        {/* Welcome */}
        <div style={{
          textAlign: 'center',
          marginBottom: '18px',
          marginTop: '10px',
          color: '#fff'
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome!</h2>
          <p style={{ fontSize: '1.1rem' }}>
            <span style={{ color: userId ? '#c00' : 'red', fontWeight: 'bold' }}>
              {userId
                ? `Credits remaining: ${credits !== null ? credits : '...'}`
                : 'You are logged out'}
            </span><br />
            💡 Tip: Upgrade your plan for more credits and full video access.
          </p>
          {/* Removed the blue 'You are logged out' sign, keeping only the red one */}
        </div>

        {/* Tools Section */}
        <div className="tools-grid" style={{ ...toolsGrid, zIndex: 3, position: 'relative' }}>
          <div className="tools-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '30px', zIndex: 3, position: 'relative', marginTop: '10px' }}>
            <ToolBox 
              title="🖼️ Generate Image"
              desc="Create stunning images from your prompt using our text-to-image tool."
              price="2 credits / image"
              link="/generate-tool?type=genimage"
            />
            <ToolBox 
              title="🎞️ Generate Video"
              desc="Transform images into cinematic motion with DreamMotion’s engine."
              price="From 4 credits / second"
              link="/generate-tool?type=genvideo"
            />
            <ToolBox 
              title="📽️ Text to Video"
              desc="Describe a scene and let DreamMotion create an animated video for you."
              price="From 5 credits / second"
              link="/generate-tool?type=text2video"
            />
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer style={{
        width: '100vw',
        textAlign: 'center',
        padding: '18px 0 12px 0',
        color: '#eee',
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        zIndex: 4,
        position: 'relative',
        marginTop: 'auto',
        background: 'rgba(0,0,0,0.15)'
      }}>
        <Link href="/privacy-policy" style={{ color: '#eee', margin: '0 18px', textDecoration: 'underline' }}>Privacy Policy</Link>
        <Link href="/faq" style={{ color: '#eee', margin: '0 18px', textDecoration: 'underline' }}>FAQ</Link>
        <Link href="/terms" style={{ color: '#eee', margin: '0 18px', textDecoration: 'underline' }}>Terms of Service</Link>
        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#ccc' }}>
          © 2025 DreamMotion. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function ToolBox({ title, desc, price, link }) {
  return (
    <div className="tool-box" style={{
      backgroundColor: '#fff', // white
      color: '#222', // dark text
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      padding: '16px',
      marginBottom: '18px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      maxWidth: '320px',
      flex: '1 1 0',
      textAlign: 'center',
      zIndex: 4,
      position: 'relative'
    }}>
      <h3 style={boxTitle}>{title}</h3>
      {title.includes('Image to Video') && (
        <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '8px' }}>NSFW generation is allowed</p>
      )}
      <p style={boxText}>{desc}</p>
      <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#c00' }}>{price}</p>
      <Link href={link}>
        <button style={{
          backgroundColor: '#1a1a1a', // dark grey
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          padding: '12px 20px',
          marginBottom: '12px',
          cursor: 'pointer',
          transition: 'background 0.2s',
          width: '100%'
        }}>Open Tool</button>
      </Link>
    </div>
  );
}

// Styles
const navLink = {
  color: '#fff',
  fontWeight: 'bold'
};

const navButton = {
  color: '#fff',
  fontWeight: 'bold',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer'
};

const toolsGrid = {
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '30px'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '30px'
};

const boxStyle = {
  backgroundColor: '#f1f1f1',
  padding: '14px 18px',
  borderRadius: '12px',
  boxShadow: '0 0 12px rgba(0,0,0,0.05)',
  maxWidth: '320px',
  width: '100%',
  textAlign: 'center'
};

const boxTitle = {
  marginBottom: '10px',
  color: '#111'
};

const boxText = {
  color: '#444'
};

const buttonStyle = {
  marginTop: '15px',
  padding: '10px 20px',
  fontSize: '1rem',
  backgroundColor: '#6a00ff',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};
