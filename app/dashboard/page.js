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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('video4'); // Default background

  useEffect(() => {
    // Check for payment success parameter and auto-add credits
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      const productCode = urlParams.get('product');
      const planName = urlParams.get('plan');
      
      // Immediately clean up URL to prevent reprocessing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (productCode && !sessionStorage.getItem('payment_processed')) {
        // Mark payment as being processed to prevent duplicates
        sessionStorage.setItem('payment_processed', 'true');
        // Process automatic credit addition
        processPaymentSuccess(productCode, planName);
      } else if (productCode) {
        // Payment already processed this session
        setPaymentSuccess(true);
        setPaymentMessage('Payment already processed this session.');
        setTimeout(() => {
          setPaymentSuccess(false);
          setPaymentMessage('');
        }, 3000);
      } else {
        // Fallback for old payment success without product code
        setPaymentSuccess(true);
        setPaymentMessage('Payment successful! Please contact support if credits are not added automatically.');
        setTimeout(() => {
          setPaymentSuccess(false);
          setPaymentMessage('');
        }, 5000);
      }
    }
  }, []);

  const processPaymentSuccess = async (productCode, planName) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPaymentMessage('Payment successful, but please log in to receive credits.');
        return;
      }

      // Call API to add credits
      const response = await fetch('/api/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          product_code: productCode,
          transaction_id: `return_${Date.now()}_${productCode}`
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentSuccess(true);
        setPaymentMessage(`🎉 Payment successful! ${result.credits_added} credits added to your account. New balance: ${result.new_balance} credits.`);
        // Clear the session marker after successful processing
        sessionStorage.removeItem('payment_processed');
        // Refresh credits display
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else if (result.already_processed) {
        setPaymentSuccess(true);
        setPaymentMessage('Payment already processed. Your credits have been added previously.');
        sessionStorage.removeItem('payment_processed');
      } else {
        setPaymentMessage('Payment successful, but there was an issue adding credits. Please contact support.');
        sessionStorage.removeItem('payment_processed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentMessage('Payment successful, but there was an issue adding credits. Please contact support.');
      sessionStorage.removeItem('payment_processed');
    }

    // Hide message after 8 seconds
    setTimeout(() => {
      setPaymentSuccess(false);
      setPaymentMessage('');
    }, 8000);
  };

  useEffect(() => {
    const fetchUserCredits = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Failed to fetch user:', authError?.message || 'No user found');
        setUserId(null);
        setCredits(0); // Fallback to 0 credits
        return;
      }

      setUserId(user.id);

      // First, check if user exists and handle duplicates
      let { data: allUserData, error: queryError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id);

      if (queryError) {
        console.error('Supabase query error:', queryError.message);
        setCredits(0); // Fallback to 0 credits
        return;
      }

      if (!allUserData || allUserData.length === 0) {
        // No user found, create new user
        console.log('No user found, creating new user with 10 credits');
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ id: user.id, email: user.email, credits: 10 }]);

        if (!insertError) {
          console.log('New user inserted with 10 credits');
          setCredits(10);
        } else {
          console.error('Insert failed:', insertError.message);
          setCredits(0); // Fallback to 0 credits
        }
      } else if (allUserData.length > 1) {
        // Multiple users found - this shouldn't happen, but let's handle it
        console.warn(`Found ${allUserData.length} duplicate entries for user ${user.id}. Using the first one.`);
        setCredits(allUserData[0].credits);
        
        // Optionally, you could clean up duplicates here
        // Remove duplicate entries (keep the first one)
        for (let i = 1; i < allUserData.length; i++) {
          await supabase
            .from('users')
            .delete()
            .eq('id', user.id)
            .limit(1);
        }
        console.log('Cleaned up duplicate entries');
      } else {
        // Exactly one user found - normal case
        setCredits(allUserData[0].credits);
        console.log('Credits updated:', allUserData[0].credits);
      }
    };

    fetchUserCredits();

    // Listen for page focus to refresh credits when user comes back from generation tools
    const handleFocus = () => {
      console.log('Page focused, refreshing credits...'); // Debug log
      fetchUserCredits();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refreshing credits...'); // Debug log
        fetchUserCredits();
      }
    };

    // Add popstate listener for browser back button
    const handlePopState = () => {
      console.log('Navigation detected, refreshing credits...'); // Debug log
      setTimeout(fetchUserCredits, 100); // Small delay to ensure navigation is complete
    };

    // Add storage listener for cross-tab communication
    const handleStorageChange = (e) => {
      if (e.key === 'credits_updated') {
        console.log('Storage change detected, refreshing credits...'); // Debug log
        fetchUserCredits();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserCredits();
      } else {
        setUserId(null);
        setCredits(null);
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
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

  useEffect(() => {
    const interval = setInterval(async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('user_id', userId)
          .single();

        if (!error) {
          setCredits(data.credits);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setCredits(null);
    // No redirect — stay on dashboard
  };

  if (isMobile) {
    return <MobileDashboard credits={credits} userId={userId} handleLogout={handleLogout} />;
  }

  return (
    <div>
      {/* Payment Success Message */}
      {paymentSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#4CAF50',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          fontSize: '16px',
          fontWeight: 'bold',
          maxWidth: '400px',
          wordWrap: 'break-word'
        }}>
          {paymentMessage || '🎉 Payment successful! Credits added to your account.'}
        </div>
      )}
      
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
          <source src="/background-video4.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 0
        }}></div>
        <style>{`
          @media (max-width: 480px) {
            video {
              object-fit: cover !important;
            }
            div {
              background: rgba(0, 0, 0, 0.7) !important;
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
            <div className="tools-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px', zIndex: 3, position: 'relative', marginTop: '10px' }}>
              <ToolBox 
                title="🖼️ Generate Image"
                desc="Create stunning images from your prompt using our text-to-image tool."
                price="3 credits / image"
                link="/generate-tool?type=genimage"
              />
              <ToolBox 
                title="🎞️ Image to Video"
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
              <ToolBox 
                title="🧪 Experimental Tool Coming Soon"
                desc="We're working on something powerful, creative, and unlike anything you've seen. Stay tuned — this new tool will break boundaries"
                price=""
                link=""
                disabled={true}
              />
            </div>
          </div>
          
          {/* Footer moved closer to tools */}
          <footer style={{
            width: '100%',
            textAlign: 'center',
            padding: '32px 0 18px 0',
            color: '#eee',
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
            zIndex: 4,
            position: 'relative',
            marginTop: '60px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '12px'
          }}>
            <Link href="/privacy-policy" style={{ color: '#eee', margin: '0 18px', textDecoration: 'underline' }}>Privacy Policy</Link>
            <Link href="/faq" style={{ color: '#eee', margin: '0 18px', textDecoration: 'underline' }}>FAQ</Link>
            <Link href="/terms" style={{ color: '#eee', margin: '0 18px', textDecoration: 'underline' }}>Terms of Service</Link>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#ccc' }}>
              © 2025 DreamMotion. All rights reserved.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function ToolBox({ title, desc, price, link, disabled = false }) {
  const isDisabled = disabled || !link;
  
  return (
    <div className="tool-box" style={{
      backgroundColor: '#0f0f0f', // Dark background like generation tools
      color: '#ffffff', // White text
      borderRadius: '16px', // Slightly more rounded
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)', // Enhanced shadow
      padding: '24px', // Increased padding
      marginBottom: '18px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      maxWidth: '280px',
      flex: '1 1 0',
      textAlign: 'center',
      zIndex: 4,
      position: 'relative',
      opacity: isDisabled ? 0.7 : 1,
      minHeight: '300px', // Slightly taller
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: "'Inter', sans-serif", // Inter font
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)' // Subtle border
    }}>
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '12px',
          color: isDisabled ? '#666' : '#ffffff',
          letterSpacing: '0.5px'
        }}>{title}</h3>
        <p style={{
          fontSize: '14px',
          lineHeight: '1.5',
          color: isDisabled ? '#666' : '#cccccc',
          flex: '1',
          marginBottom: '16px'
        }}>{desc}</p>
        <p style={{ 
          marginTop: '10px', 
          fontWeight: 'bold', 
          color: isDisabled ? '#666' : '#ff4b2b', // Red color for price like generation tools
          fontSize: '16px'
        }}>{price}</p>
      </div>
      <div style={{
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        marginTop: 'auto'
      }}>
        {isDisabled ? (
          <button style={{
            backgroundColor: '#333',
            color: '#888',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            padding: '14px 24px',
            marginBottom: '12px',
            cursor: 'not-allowed',
            width: '100%',
            fontSize: '1rem',
            boxSizing: 'border-box',
            fontFamily: "'Inter', sans-serif"
          }} disabled>
            Coming Soon
          </button>
        ) : (
          <Link href={link} style={{ width: '100%' }}>
            <button style={{
              background: 'linear-gradient(to right, #ffffff, #e0e0e0)', // White gradient like generation tools
              color: '#000000', // Black text
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              padding: '14px 24px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              fontSize: '1rem',
              boxSizing: 'border-box',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.5px'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >Open Tool</button>
          </Link>
        )}
      </div>
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
  borderRadius: '12px',
  maxWidth: '320px',
  width: '100%',
  textAlign: 'center',
  position: 'relative',
  zIndex: 4
};

const textStyle = {
  color: '#111',
  marginTop: '15px',
  marginBottom: '10px',
  fontWeight: 'bold'
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

const boxTitle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '10px',
};
