"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) setShowCookie(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookie(false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen text-white flex-col gap-6"
      style={{
        backgroundImage: "url('/background-4.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000'
      }}
    >
      <h1 className="text-5xl font-bold">DreamMotion</h1>
      <Link href="/dashboard">
        <button className="px-6 py-3 bg-white text-black rounded text-lg hover:bg-gray-300 transition">Enter</button>
      </Link>

      {showCookie && (
        <div className="fixed bottom-0 left-0 right-0 bg-white text-black p-4 text-center z-50">
          <p>This website uses cookies to enhance the user experience.</p>
          <button
            className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            onClick={acceptCookies}
          >
            Accept Cookies
          </button>
        </div>
      )}
    </div>
  );
}
