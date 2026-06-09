'use client';

import { Suspense } from 'react';
import ConsultaTramiteContent from './ConsultaTramiteContent';

export default function ConsultaTramitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin">
          <svg className="w-16 h-16 text-[#8B1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-black font-medium mt-4">Cargando...</p>
      </div>
    }>
      <ConsultaTramiteContent />
    </Suspense>
  );
}
