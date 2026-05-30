'use client'

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  return (
    <header className="w-full bg-red-900 text-white shadow-lg">
      
      <div className="flex items-center justify-between h-16 px-4 md:px-6">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-4">

          {/* MENU MOBILE */}
          <button
            onClick={onMenuClick}
            className="
              md:hidden
              text-2xl
              hover:text-red-200
              transition
            "
          >
            ☰
          </button>

          {/* LOGO + TITULO */}
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
                Panel Bibliotecario
              </span>
            </div>

          </div>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-4">

          {/* USUARIO */}
          <div className="
            hidden sm:flex
            items-center
            gap-2
            bg-red-800
            px-4
            py-2
            rounded-full
            shadow-sm
          ">
            <span className="text-sm">👤</span>

            <span className="text-sm font-medium">
              Bibliotecario
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
              shadow-md
              hover:bg-gray-200
              hover:scale-105
              transition
            "
          >
            Cerrar sesión
          </button>

        </div>

      </div>
    </header>
  );
}