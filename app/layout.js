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
