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
    const checkPayhip = () => {
      if (typeof window !== 'undefined' && typeof window.Payhip !== 'undefined') {
        setPayhipLoaded(true);
        console.log('Payhip API is ready');
      }
    };
    
    checkPayhip();
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
        theme: 'none',
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
      <style>{`
        @media (max-width: 900px) {
          .subscribe-plans {
            flex-direction: column !important;
            gap: 18px !important;
            max-width: 100vw !important;
            padding: 0 2vw !important;
          }
          .plan-card {
            max-width: 98vw !important;
            width: 98vw !important;
            padding: 18px 2vw !important;
            font-size: 1rem !important;
            border-radius: 10px !important;
          }
          .plan-card button {
            width: 100% !important;
            font-size: 1.05rem !important;
            padding: 14px 0 !important;
            border-radius: 14px !important;
          }
        }
        @media (max-width: 600px) {
          .plan-card {
            padding: 12px 1vw !important;
            font-size: 0.98rem !important;
          }
        }
        @media (max-width: 480px) {
          .subscribe-plans {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 0 1vw !important;
          }
          .plan-card {
            max-width: 95vw !important;
            width: 95vw !important;
            padding: 10px 1vw !important;
            font-size: 0.9rem !important;
            border-radius: 8px !important;
          }
          .plan-card button {
            width: 100% !important;
            font-size: 1rem !important;
            padding: 12px 0 !important;
            border-radius: 12px !important;
          }
          h1 {
            font-size: 24px !important;
          }
          div {
            font-size: 14px !important;
          }
        }
      `}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 0 }} />
      <h1 style={{ fontSize: '32px', marginBottom: '16px', zIndex: 2 }}>Subscription Plans</h1>
      <div style={{ fontSize: '16px', color: 'white', marginBottom: '32px', textAlign: 'center', zIndex: 2 }}>
        Choose the best plan for your creative journey — buy credits once and use them freely on any tool, anytime.
      </div>
      <div className="subscribe-plans" style={{
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 2,
        alignItems: 'stretch'
      }}>
        {[
          {
            title: "Starter Plan",
            price: "$4.99",
            credits: "100 Credits",
            usage: "Estimated 2–8 generations",
            type: "starter",
            features: [
              "✔ Access to basic tools",
              "✔ Standard resolution export",
              "✔ Great for testing new styles"
            ]
          },
          {
            title: "Basic Plan — Most Popular",
            price: "$9.99",
            credits: "250 Credits",
            usage: "Estimated 6–20 generations",
            type: "basic",
            features: [
              "✔ Unlock all image & video models",
              "✔ HD video generation",
              "✔ Designed for casual creators"
            ]
          },
          {
            title: "Pro Plan — Best Value",
            price: "$19.99",
            credits: "600 Credits",
            usage: "Estimated 15–50 generations",
            type: "pro",
            features: [
              "✔ Includes all Basic features",
              "✔ High-resolution cinematic quality",
              "✔ Priority video rendering queue",
              "✔ Ideal for regular creators and animators"
            ]
          },
          {
            title: "Elite Plan",
            price: "$49.99",
            credits: "2,000 Credits",
            usage: "Estimated 50–160 generations",
            type: "elite",
            features: [
              "✔ Includes all Pro features",
              "✔ Maximum rendering speed",
              "✔ Early access to new tools",
              "✔ Perfect for power users or studios"
            ]
          },
        ].map((plan, i) => (
          <div key={i} className="plan-card" style={{
            background: 'white',
            color: 'black',
            padding: '20px',
            borderRadius: '10px',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '400px'
          }}>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{plan.title}</h2>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{plan.price}</p>
              <p style={{ margin: '5px 0' }}>{plan.credits}</p>
              <p style={{ fontSize: '14px', color: '#aaa', marginBottom: plan.features ? '8px' : '0' }}>{plan.usage}</p>
              {plan.features && (
                <div style={{ fontSize: '14px', color: '#222', marginBottom: '8px', textAlign: 'left', flex: '1' }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} style={{ marginBottom: '2px' }}>{feature}</div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => handlePurchase(plan.type)}
              disabled={loadingPlan === plan.type}
              style={{
                marginTop: 'auto',
                background: loadingPlan === plan.type ? '#666' : 'black',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: loadingPlan === plan.type ? 'not-allowed' : 'pointer',
                alignSelf: 'stretch',
                opacity: loadingPlan === plan.type ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loadingPlan === plan.type ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
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
        }}
        src="/background-video4.mp4"
      />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }} />
      </div>
    </>
  );
}
