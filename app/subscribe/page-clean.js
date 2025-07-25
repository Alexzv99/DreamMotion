"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function SubscribePage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [payhipLoaded, setPayhipLoaded] = useState(false);

  // Add Payhip script loading useEffect
  useEffect(() => {
    // Payhip script is loaded via Script component
    const checkPayhip = () => {
      if (typeof window !== 'undefined' && typeof window.Payhip !== 'undefined') {
        setPayhipLoaded(true);
        console.log('Payhip API is ready');
      }
    };
    
    checkPayhip();
    // Check periodically if not loaded yet
    const interval = setInterval(checkPayhip, 500);
    
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = (planType) => {
    setLoadingPlan(planType);
    
    // Wait for Payhip to load
    if (!payhipLoaded || typeof window.Payhip === 'undefined') {
      console.log('Payhip not loaded yet, retrying...');
      setTimeout(() => handlePurchase(planType), 500);
      return;
    }
    
    // Get the product code for the selected plan
    const productCodes = {
      starter: 'CLhkc',
      basic: '3Fh0t', 
      pro: 'zv78T',
      elite: 'USlOw'
    };
    
    const productCode = productCodes[planType];
    
    if (productCode) {
      console.log(`🚀 Initiating Payhip Checkout for ${planType} plan with product code: ${productCode}`);
      
      // Use official Payhip checkout API
      window.Payhip.Checkout.open({
        product: productCode,
        method: 'overlay',
        theme: 'none', // Use custom styling
        title: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
        message: `Get instant access to all ${planType} plan features`,
        successUrl: `${window.location.origin}/dashboard?payment=success&product=${productCode}&plan=${planType}`,
        successCallback: function(data) {
          console.log('Payment successful:', data);
          window.location.href = `/dashboard?payment=success&product=${productCode}&plan=${planType}`;
        }
      });
      
      setLoadingPlan(null);
    } else {
      setLoadingPlan(null);
      alert('This plan is not yet available. Please contact support.');
    }
  };

  return (
    <>
      {/* Load Payhip script */}
      <Script 
        src="https://payhip.com/payhip.js"
        onLoad={() => {
          console.log('Payhip script loaded');
          setPayhipLoaded(true);
        }}
        strategy="beforeInteractive"
      />
      
      <div style={{
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '50px',
        fontFamily: 'sans-serif',
        position: 'relative'
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
            zIndex: -1
          }}
        >
          <source src="/subscribe-bg.jpg" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 0
        }} />

        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#333',
            color: 'white',
            border: '2px solid #555',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem',
            zIndex: 1
          }}
        >
          ← Back
        </button>

        <div style={{ 
          textAlign: 'center', 
          marginBottom: '60px',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #fff, #ddd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Choose Your Plan
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Unlock the full potential of AI-powered content creation
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Starter Plan */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px 30px',
            textAlign: 'center',
            position: 'relative',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff' }}>Starter</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
              $4.99
              <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', color: '#fff' }}>
              <li style={{ marginBottom: '10px' }}>✓ 1,000 AI Credits</li>
              <li style={{ marginBottom: '10px' }}>✓ Basic Image Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ Standard Support</li>
              <li style={{ marginBottom: '10px' }}>✓ Community Access</li>
            </ul>
            <button
              onClick={() => handlePurchase('starter')}
              disabled={loadingPlan === 'starter'}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: loadingPlan === 'starter' ? '#666' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loadingPlan === 'starter' ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              {loadingPlan === 'starter' ? 'Processing...' : 'Get Started'}
            </button>
          </div>

          {/* Basic Plan */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px 30px',
            textAlign: 'center',
            position: 'relative',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff' }}>Basic</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
              $9.99
              <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', color: '#fff' }}>
              <li style={{ marginBottom: '10px' }}>✓ 3,000 AI Credits</li>
              <li style={{ marginBottom: '10px' }}>✓ Advanced Image Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ Basic Video Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ Priority Support</li>
            </ul>
            <button
              onClick={() => handlePurchase('basic')}
              disabled={loadingPlan === 'basic'}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: loadingPlan === 'basic' ? '#666' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loadingPlan === 'basic' ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              {loadingPlan === 'basic' ? 'Processing...' : 'Choose Basic'}
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '2px solid #ffd700',
            padding: '40px 30px',
            textAlign: 'center',
            position: 'relative',
            transform: 'scale(1.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ffd700',
              color: '#000',
              padding: '4px 16px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              MOST POPULAR
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff' }}>Pro</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
              $19.99
              <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', color: '#fff' }}>
              <li style={{ marginBottom: '10px' }}>✓ 10,000 AI Credits</li>
              <li style={{ marginBottom: '10px' }}>✓ Premium Image Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ Advanced Video Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ Commercial License</li>
              <li style={{ marginBottom: '10px' }}>✓ VIP Support</li>
            </ul>
            <button
              onClick={() => handlePurchase('pro')}
              disabled={loadingPlan === 'pro'}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: loadingPlan === 'pro' ? '#666' : '#ffd700',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loadingPlan === 'pro' ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              {loadingPlan === 'pro' ? 'Processing...' : 'Go Pro'}
            </button>
          </div>

          {/* Elite Plan */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px 30px',
            textAlign: 'center',
            position: 'relative',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff' }}>Elite</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
              $39.99
              <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', color: '#fff' }}>
              <li style={{ marginBottom: '10px' }}>✓ 25,000 AI Credits</li>
              <li style={{ marginBottom: '10px' }}>✓ Unlimited Image Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ Premium Video Generation</li>
              <li style={{ marginBottom: '10px' }}>✓ API Access</li>
              <li style={{ marginBottom: '10px' }}>✓ Dedicated Support</li>
            </ul>
            <button
              onClick={() => handlePurchase('elite')}
              disabled={loadingPlan === 'elite'}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: loadingPlan === 'elite' ? '#666' : '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loadingPlan === 'elite' ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              {loadingPlan === 'elite' ? 'Processing...' : 'Go Elite'}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Secure Payment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>PayPal & Credit Cards</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🚀</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Instant Access</span>
            </div>
          </div>
          <div style={{
            fontSize: '0.8rem',
            opacity: 0.7,
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            🔒 Secure 256-bit SSL encryption
            <br />Your payment information is safe and protected
          </div>
        </div>
      </div>
    </>
  );
}
