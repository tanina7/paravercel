'use client'
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function CajeroLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">

      {/* HEADER */}
      <Header toggleSidebar={() => setOpen(true)} />

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR DESKTOP */}
        <div className="hidden md:flex">
          <Sidebar open={true} setOpen={() => {}} />
        </div>

        {/* SIDEBAR MOBILE OVERLAY */}
        {open && (
          <div className="fixed inset-0 z-50 flex">

            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />

            {/* SIDEBAR */}
            <div className="relative">
              <Sidebar open={true} setOpen={setOpen} />
            </div>

          </div>
        )}

        {/* CONTENIDO */}
        <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}