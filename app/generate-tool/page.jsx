'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';

const MobileGenerateToolClient = dynamic(() => import('./MobileGenerateToolClient'));
const GenerateToolClient = dynamic(() => import('./GenerateToolClient'));

export default function Page() {
  const [isMobile, setIsMobile] = useState(false);

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

  if (isMobile) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MobileGenerateToolClient />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateToolClient />
    </Suspense>
  );
}