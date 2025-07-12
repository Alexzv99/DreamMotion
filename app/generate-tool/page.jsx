'use client';

import { Suspense } from 'react';
import GenerateToolClient from './GenerateToolClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateToolClient />
    </Suspense>
  );
}