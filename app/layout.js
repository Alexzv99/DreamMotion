// app/layout.js
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
      </body>
    </html>
  );
}
