'use client'

export default function Header({ onMenuClick }: any) {
  return (
    <div className="w-full bg-red-900 text-white shadow-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-3">

          {/* BOTON MOBILE */}
          <button
            onClick={onMenuClick}
            className="md:hidden text-xl"
          >
            ☰
          </button>

          <img src="/logo.png" className="h-10" />

          <span className="font-bold text-lg hidden sm:block">
            Sistema de Trámites
          </span>
        </div>

        {/* USUARIO */}
        <div className="text-sm">
          Bibliotecario 👤
        </div>

      </div>
    </div>
  );
}