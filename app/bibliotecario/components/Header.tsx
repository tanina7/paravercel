'use client'

export default function Header({ onMenuClick }: any) {

  const handleLogout = () => {
    localStorage.removeItem('token'); // 👈 elimina tu token
    window.location.href = '/auth/login';  // 👈 redirige al login
  };

  return (
    <div className="w-full bg-red-900 text-white shadow-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-3">

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

        {/* USUARIO + LOGOUT */}
        <div className="flex items-center gap-3 text-sm">
          <span>Bibliotecario 👤</span>

          <button
            onClick={handleLogout}
            className="bg-white text-red-900 px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-200"
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}