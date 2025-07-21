"use client";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const router = useRouter();
  return (
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
        zIndex: 2, // Increased zIndex to ensure boxes are above the overlay
        alignItems: 'stretch' // This ensures all cards have equal height
      }}>
        {[
          {
            title: "Starter Plan",
            price: "$4.99",
            credits: "100 Credits",
            usage: "Estimated 2–8 generations",
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
            <button style={{
              marginTop: 'auto',
              background: 'black',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              alignSelf: 'stretch'
            }}>Buy Now</button>
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
        src="/background-video1.mp4"
      />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)', // Matched opacity with the dashboard
        zIndex: 1
      }} />
    </div>
  );
}

// Plans
const plans = [
  {
    name: "Free Trial",
    price: "200 credits",
    credits: "",
    features: [
      "✔ Use credits on any tool",
      "✖ NSFW content disabled",
      "✖ No HD resolution"
    ]
  },
  {
    name: "Basic Plan",
    price: "$9.99/month",
    credits: "500 credits/month",
    features: [
      "✖ NSFW generation locked",
      "✔ High-resolution exports",
      "✔ Priority processing"
    ]
  },
  {
    name: "Pro Plan",
    price: "$17.99/month",
    credits: "1000 credits/month",
    features: [
      "✔ All Basic features",
      "✔ Faster video generation",
      "✔ Private mode support"
    ]
  },
  {
    name: "Plus Plan",
    price: "$49.99/month",
    credits: "3000 credits/month",
    features: [
      "✔ All Pro features",
      "✔ Maximum speed access",
      "✔ Early access to new tools"
    ]
  }
];

// Styles
const planCardStyle = {
  background: '#f5f5f7',
  color: '#111',
  padding: '25px',
  borderRadius: '12px',
  width: '260px',
  minWidth: '260px',
  boxShadow: '0 0 20px rgba(0,0,0,0.25)',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const planTitle = {
  marginBottom: '10px',
  fontSize: '1.4rem',
  fontWeight: 'bold'
};

const planPrice = {
  fontSize: '1.2rem',
  fontWeight: 'bold',
  marginBottom: '5px'
};

const creditNote = {
  fontSize: '1rem',
  marginBottom: '15px'
};

const featureList = {
  listStyle: 'none',
  padding: 0,
  lineHeight: '1.6',
  marginBottom: '20px'
};

const chooseBtn = {
  padding: '10px 15px',
  borderRadius: '6px',
  backgroundColor: '#111',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};
