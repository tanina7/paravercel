'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <Link 
          href="/usuario/landing" 
          className="flex items-center gap-2 hover:opacity-90 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B1A1A] to-[#6B1415] flex items-center justify-center shadow-md shadow-red-900/10 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <h1 className="text-xl font-bold text-[#8B1A1A] tracking-tight group-hover:translate-x-0.5 transition-transform duration-300">
            Trámites Univalle
          </h1>
        </Link>

        {/* User Session and Action Area */}
        <div className="flex items-center gap-4 animate-fadeIn">
          {user && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estudiante</span>
              <span className="text-sm font-semibold text-black leading-tight">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.nombre || user.name || 'Estudiante'}
              </span>
              {user.email && (
                <span className="text-xs text-black font-medium leading-none max-w-[150px] sm:max-w-[220px] truncate" title={user.email}>
                  {user.email}
                </span>
              )}
            </div>
          )}

          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 border border-red-200 hover:border-red-300 text-[#8B1A1A] rounded-lg text-sm font-bold shadow-sm hover:shadow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg 
                className="w-4 h-4 text-[#8B1A1A] transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </nav>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
