// app/layout.js
import Script from 'next/script';

export const metadata = {
  title: 'DreamMotion',
  description: 'Create AI animations from images or text prompts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>DreamMotion - AI Animation Platform</title>
        <meta name="description" content="Create AI animations from images or text prompts. Fast, creative, and easy to use." />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph / Social Meta Tags */}
        <meta property="og:title" content="DreamMotion - AI Animation Platform" />
        <meta property="og:description" content="Create AI animations from images or text prompts. Fast, creative, and easy to use." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://dreammotion.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DreamMotion - AI Animation Platform" />
        <meta name="twitter:description" content="Create AI animations from images or text prompts. Fast, creative, and easy to use." />
        <meta name="twitter:image" content="/logo.png" />
      </head>
      <body style={{
        margin: 0,
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}>
        {children}
        
        {/* Tawk.to Live Chat */}
        <Script
          id="tawk-to"
          src="https://embed.tawk.to/6881f9cdbca853191b425cc7/1j0trfj6p"
          strategy="afterInteractive"
        />
        
        {/* Initialize Tawk_API */}
        <Script
          id="tawk-init"
          strategy="beforeInteractive"
        >
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          `}
        </Script>
        
        {/* Payhip Integration - Embedded Buy Buttons */}
        <Script
          id="payhip-script"
          src="https://payhip.com/payhip.js"
          strategy="afterInteractive"
        />
        
        {/* Payhip Configuration */}
        <Script
          id="payhip-init"
          strategy="afterInteractive"
        >
          {`
            // Configure Payhip for embedded checkout with cart/wishlist hiding
            window.addEventListener('load', function() {
              console.log('Initializing Payhip...');
              
              // Add global CSS to hide cart/wishlist elements
              const globalStyle = document.createElement('style');
              globalStyle.textContent = 
                '.payhip-embed .btn-cart, .payhip-embed .btn-wishlist, .payhip-embed .btn-secondary,' +
                '.payhip-overlay .btn-cart, .payhip-overlay .btn-wishlist, .payhip-overlay .btn-secondary,' +
                '[data-payhip-product-id] .btn-cart, [data-payhip-product-id] .btn-wishlist,' +
                '[data-payhip-product-id] .btn-secondary { display: none !important; visibility: hidden !important; }';
              document.head.appendChild(globalStyle);
              
              // Wait for Payhip to be fully loaded
              const initPayhip = () => {
                if (window.payhip) {
                  console.log('✅ Payhip loaded successfully');
                  
                  try {
                    // Try to initialize Payhip with overlay configuration
                    if (typeof window.payhip.init === 'function') {
                      window.payhip.init({
                        mode: 'overlay',
                        theme: 'overlay',
                        hideCart: true,
                        hideWishlist: true,
                        checkoutOnly: true
                      });
                      console.log('✅ Payhip initialized with enhanced overlay mode');
                    }
                    
                    // Set global overlay configuration if available
                    if (window.payhip.overlay && typeof window.payhip.overlay.config === 'object') {
                      window.payhip.overlay.config = {
                        hideCart: true,
                        hideWishlist: true,
                        directCheckout: true,
                        onComplete: function(data) {
                          console.log('Payment completed via global config:', data);
                        },
                        onCancel: function() {
                          console.log('Payment cancelled via global config');
                        },
                        onError: function(error) {
                          console.error('Payment error via global config:', error);
                        }
                      };
                      console.log('✅ Payhip overlay config set with cart/wishlist hiding');
                    }
                    
                    // Override any existing Payhip purchase functions to include parameters
                    if (window.payhip.purchase) {
                      const originalPurchase = window.payhip.purchase;
                      window.payhip.purchase = function(productCode, options = {}) {
                        const enhancedOptions = {
                          ...options,
                          hideCart: true,
                          hideWishlist: true,
                          directCheckout: true,
                          checkoutOnly: true
                        };
                        return originalPurchase.call(this, productCode, enhancedOptions);
                      };
                      console.log('✅ Payhip purchase function enhanced');
                    }
                  } catch (error) {
                    console.warn('⚠️ Payhip configuration failed:', error);
                  }
                } else {
                  console.warn('⚠️ Payhip not loaded, retrying...');
                  setTimeout(initPayhip, 1000); // Retry after 1 second
                }
              };
              
              // Start initialization
              initPayhip();
            });
          `}
        </Script>
      </body>
    </html>
  );
}
