/* eslint-disable react/no-unescaped-entities */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [credits, setCredits] = useState(null);
  const [userId, setUserId] = useState(null);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setCredits(null);
    // No redirect — stay on dashboard
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundImage: 'url("/background-2.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)',
      position: 'relative',
      zoom: 0.85
    }}>
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
      `}</style>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 0
      }} />

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
          marginBottom: '30px',
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
        <div className="tools-grid" style={toolsGrid}>
          <div className="tools-row" style={rowStyle}>
            <ToolBox 
              title="🖼️ Generate Image"
              desc="Create stunning images from your prompt using our text-to-image tool."
              price="1 credit / image"
              link="/generate-tool?type=genimage"
            />
            <ToolBox 
              title="🎞️ Generate Video"
              desc="Transform images into cinematic motion with DreamMotion’s engine."
              price="2 credits / second"
              link="/generate-tool?type=genvideo"
            />
          </div>
          <div className="tools-row" style={rowStyle}>
            <ToolBox 
              title="📽️ Text to Video"
              desc="Describe a scene and let DreamMotion create an animated video for you."
              price="2 credits / second"
              link="/generate-tool?type=text2video"
            />
            <ToolBox 
              title="🧬 Image to Video"
              desc="Upload a photo and animate it with cinematic motion."
              price="5 credits / second"
              link="/generate-tool?type=image2video"
            />
          </div>

        </div>
      </div>
    </main>
  );
}
      zoom: 0.75

function ToolBox({ title, desc, price, link }) {
  return (
    <div className="tool-box" style={{
      backgroundColor: '#fff', // white
      color: '#222', // dark text
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      padding: '24px',
      marginBottom: '24px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      width: '100%',
      maxWidth: '460px',
      textAlign: 'center'
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
  padding: '25px 30px',
  borderRadius: '12px',
  boxShadow: '0 0 12px rgba(0,0,0,0.05)',
  maxWidth: '460px',
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
