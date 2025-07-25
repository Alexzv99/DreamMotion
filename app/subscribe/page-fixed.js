"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function SubscribePage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [payhipLoaded, setPayhipLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

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

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentUrl('');
  };

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

  // Custom payment overlay function that prevents redirects
  const createCustomPaymentOverlay = (productCode, planType) => {
    console.log('Creating custom payment overlay for:', productCode);
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'custom-payhip-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    // Create iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      height: 600px;
      max-height: 90vh;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: #ff3b3b;
      color: white;
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      font-size: 18px;
      cursor: pointer;
      z-index: 10003;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    const returnUrl = encodeURIComponent(
      window.location.origin + `/dashboard?payment=success&product=${productCode}&plan=${planType}`
    );
    // DIRECT CHECKOUT: Skip product page entirely and go straight to payment
    iframe.src = `https://payhip.com/checkout/${productCode}?direct=1&minimal=1&theme=light&auto_proceed=1&skip_product_page=1&instant_checkout=1&return_url=${returnUrl}`;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;
    
    // Add event listeners
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
    
    // Listen for messages from iframe (payment completion)
    const messageListener = (event) => {
      if (event.origin === 'https://payhip.com') {
        if (event.data && event.data.type === 'payment_complete') {
          console.log('Payment completed via iframe');
          document.body.removeChild(overlay);
          closePaymentModal();
          const successUrl = window.location.origin + `/dashboard?payment=success&product=${productCode}&plan=${planType}`;
          window.location.href = successUrl;
        }
      }
    };
    
    window.addEventListener('message', messageListener);
    
    // Cleanup function to remove event listener
    const cleanup = () => {
      window.removeEventListener('message', messageListener);
    };
    
    // Store cleanup function on overlay for later removal
    overlay._cleanup = cleanup;
    
    // Assemble the overlay
    iframeContainer.appendChild(closeBtn);
    iframeContainer.appendChild(iframe);
    overlay.appendChild(iframeContainer);
    document.body.appendChild(overlay);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closePaymentModal();
        // Also close custom overlay if it exists
        const customOverlay = document.getElementById('custom-payhip-overlay');
        if (customOverlay) {
          if (customOverlay._cleanup) {
            customOverlay._cleanup();
          }
          document.body.removeChild(customOverlay);
        }
      }
    };
    document.addEventListener('keydown', handleEsc, false);
    
    return () => {
      document.removeEventListener('keydown', handleEsc, false);
      
      // Cleanup any custom overlays when component unmounts
      const customOverlay = document.getElementById('custom-payhip-overlay');
      if (customOverlay) {
        if (customOverlay._cleanup) {
          customOverlay._cleanup();
        }
        if (customOverlay.parentNode) {
          customOverlay.parentNode.removeChild(customOverlay);
        }
      }
    };
  }, [showPaymentModal]);

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
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 2,
          background: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 18px',
          fontSize: '16px',
          fontFamily: 'inherit',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
        }}
      >← Back</button>
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
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90%',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Close Button */}
            <button
              onClick={closePaymentModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ff3b3b',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              title="Close"
            >
              ×
            </button>
            
            {/* Custom Checkout Content */}
            <div style={{ padding: '30px 25px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#333' }}>
                  Purchase Credits
                </h2>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Secure payment powered by DreamMotion
                </p>
              </div>
              
              {/* Plan Details */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '25px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {paymentUrl === 'starter' ? 'Starter Plan' : 
                     paymentUrl === 'basic' ? 'Basic Plan' :
                     paymentUrl === 'pro' ? 'Pro Plan' : 'Elite Plan'}
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
                    {paymentUrl === 'starter' ? '$4.99' : 
                     paymentUrl === 'basic' ? '$9.99' :
                     paymentUrl === 'pro' ? '$19.99' : '$49.99'}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                  Credits: {paymentUrl === 'starter' ? '100' : 
                           paymentUrl === 'basic' ? '250' :
                           paymentUrl === 'pro' ? '600' : '2000'} credits
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  ✓ Instant credit delivery
                  <br />✓ No subscription - pay once, use anytime
                  <br />✓ Create {paymentUrl === 'starter' ? '2-8' : 
                              paymentUrl === 'basic' ? '6-20' :
                              paymentUrl === 'pro' ? '15-50' : '50-160'} AI videos
                </div>
              </div>
              
              {/* Payment Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Payhip Buy Button Container */}
                <div 
                  id="payhip-buy-button-container"
                  style={{
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  {/* Dynamic Payhip Embedded Buy Button */}
                  <button
                    onClick={() => {
                      const productCode = 
                        paymentUrl === 'starter' ? 'CLhkc' :
                        paymentUrl === 'basic' ? '3Fh0t' :
                        paymentUrl === 'pro' ? 'zv78T' :
                        paymentUrl === 'elite' ? 'USlOw' : null;
                      
                      console.log('Payment button clicked for product:', productCode);
                      console.log('Payhip available:', !!window.payhip);
                      
                      if (productCode) {
                        // Try multiple Payhip overlay methods
                        if (window.payhip && window.payhip.overlay) {
                          console.log('Using payhip.overlay method');
                          try {
                            window.payhip.overlay(productCode, {
                              onComplete: function(data) {
                                console.log('Payment completed:', data);
                                closePaymentModal();
                                const returnUrl = window.location.origin + `/dashboard?payment=success&product=${productCode}&plan=${paymentUrl}`;
                                window.location.href = returnUrl;
                              },
                              onCancel: function() {
                                console.log('Payment cancelled by user');
                              },
                              onError: function(error) {
                                console.error('Payment error:', error);
                                alert('Payment failed. Please try again or contact support.');
                              }
                            });
                            return; // Exit if overlay worked
                          } catch (error) {
                            console.error('Payhip overlay error:', error);
                          }
                        } else if (window.payhip && window.payhip.Button) {
                          console.log('Using payhip.Button method');
                          try {
                            new window.payhip.Button({
                              product: productCode,
                              theme: 'overlay',
                              onComplete: function(data) {
                                console.log('Payment completed:', data);
                                closePaymentModal();
                                const returnUrl = window.location.origin + `/dashboard?payment=success&product=${productCode}&plan=${paymentUrl}`;
                                window.location.href = returnUrl;
                              },
                              onCancel: function() {
                                console.log('Payment cancelled by user');
                              },
                              onError: function(error) {
                                console.error('Payment error:', error);
                                alert('Payment failed. Please try again or contact support.');
                              }
                            }).click();
                            return; // Exit if Button worked
                          } catch (error) {
                            console.error('Payhip Button error:', error);
                          }
                        }
                        
                        // If we get here, embedded methods failed - show our own overlay instead of redirecting
                        console.log('Payhip overlay not available, creating custom payment iframe');
                        createCustomPaymentOverlay(productCode, paymentUrl);
                      }
                    }}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '15px 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      width: '100%',
                      textAlign: 'center'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #333 0%, #555 100%)'}
                    onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #000 0%, #333 100%)'}
                  >
                    💳 Pay Securely - ${paymentUrl === 'starter' ? '4.99' : 
                                       paymentUrl === 'basic' ? '9.99' :
                                       paymentUrl === 'pro' ? '19.99' : '49.99'}
                  </button>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#666',
                  padding: '10px'
                }}>
                  Complete your purchase directly on DreamMotion.
                  <br />Secure payment powered by Payhip.
                </div>
                
                {/* Fallback Manual Payment Button */}
                <button
                  onClick={() => {
                    const productCode = 
                      paymentUrl === 'starter' ? 'CLhkc' :
                      paymentUrl === 'basic' ? '3Fh0t' :
                      paymentUrl === 'pro' ? 'zv78T' :
                      paymentUrl === 'elite' ? 'USlOw' : null;
                    
                    if (productCode) {
                      const returnUrl = encodeURIComponent(
                        window.location.origin + `/dashboard?payment=success&product=${productCode}&plan=${paymentUrl}`
                      );
                      // Open in same window with return URL and enhanced checkout mode
                      window.location.href = `https://payhip.com/b/${productCode}?embed=1&direct=1&hide_cart=1&hide_wishlist=1&checkout=1&minimal=1&theme=light&show_product_selector=0&return_url=${returnUrl}`;
                    }
                  }}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '10px'
                  }}
                >
                  Alternative: Use Payhip Directly
                </button>
              </div>
              
              {/* Security Notice */}
              <div style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '12px',
                color: '#888'
              }}>
                🔒 Secure 256-bit SSL encryption
                <br />Your payment information is safe and protected
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
