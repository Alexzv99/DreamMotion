"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white relative"
      style={{ backgroundImage: "url('/background-4.png')" }}
    >
      {/* Overlay (optional) */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold mb-6">DreamMotion</h1>

        <Link href="/dashboard">
          <button className="px-8 py-3 bg-white text-black text-lg font-semibold rounded hover:bg-gray-200 transition">
            Enter
          </button>
        </Link>

        {!cookiesAccepted && (
          <div className="mt-6 text-sm bg-black bg-opacity-60 p-4 rounded">
            <p className="mb-2">
              This website uses cookies to <strong>enhance the user experience</strong>.
            </p>
            <button
              onClick={() => setCookiesAccepted(true)}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
            >
              Accept Cookies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
