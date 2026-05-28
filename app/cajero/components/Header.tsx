'use client'

import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  return (
    <header className="w-full bg-red-900 text-white shadow-lg">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-4">

          {/* BOTÓN MOBILE */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-2xl hover:text-gray-300 transition"
          >
            ☰
          </button>

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-lg">
                Sistema de Trámites
              </span>

              <span className="text-xs text-red-200">
                Panel Administrativo
              </span>
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-4">

          {/* USUARIO */}
          <div className="hidden sm:flex items-center gap-2 bg-red-800 px-3 py-1 rounded-full">
            <span className="text-sm">👤</span>

            <span className="text-sm font-medium">
              Cajero
            </span>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="
              bg-white
              text-red-900
              px-4
              py-2
              rounded-lg
              text-sm
              font-semibold
              hover:bg-gray-200
              transition
              shadow
            "
          >
            Cerrar sesión
          </button>

        </div>
      </div>
    </header>
  );
}