'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // <-- Agregamos useRouter

export default function TramitesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // <-- Inicializamos el router

  // Menú basado en tu imagen de referencia
  const menuOptions = [
    { name: 'Trámites Activos', href: '/tramites', icon: 'description' },
    { name: 'Historial', href: '/tramites/historial', icon: 'history' },
    { name: 'Transacciones', href: '/tramites/transacciones', icon: 'credit_card' },
    { name: 'Firmas Digitales', href: '/tramites/firmas', icon: 'draw' },
    { name: 'Firmas Disponibles', href: '/tramites/firmas-disponibles', icon: 'draw' }
  ];

  const handleCerrarSesion = () => {
    // Aquí a futuro podrías limpiar tokens o cookies si lo necesitas
    router.push('/'); // <-- Te redirige a la página principal/login
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Barra Superior Guindo */}
      <header className="h-16 bg-[#8B1A1A] flex items-center justify-between px-6 shadow-md z-20">
        <div className="flex items-center gap-3 text-white">
          <span className="material-symbols-outlined text-3xl">account_balance</span>
          <h1 className="text-lg font-bold tracking-wide">
            UNIVALLE <span className="font-light">| SISTEMA DE TRÁMITES</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm font-medium mr-2">Rol: Administrador</span>
          <span className="material-symbols-outlined text-2xl">account_circle</span>
        </div>
      </header>

      {/* Contenedor Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Barra Lateral Izquierda */}
        <aside className="w-64 bg-white shadow-lg border-r border-gray-200 hidden md:flex flex-col z-10 justify-between">
          
          {/* Parte superior de la barra lateral (Menú) */}
          <div>
            <div className="p-6 pb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menú Principal</p>
            </div>
            
            <nav className="px-4 py-2 space-y-2">
              {menuOptions.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-[#8B1A1A]/10 text-[#8B1A1A]' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#8B1A1A]'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${isActive ? 'text-[#8B1A1A]' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Parte inferior de la barra lateral (Botones de Acción) */}
          <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
            {/* Botón Atrás */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all text-left"
            >
              <span className="material-symbols-outlined text-gray-500">arrow_back</span>
              Volver Atrás
            </button>

            {/* Botón Cerrar Sesión */}
            <button 
              onClick={handleCerrarSesion}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-[#8B1A1A] hover:bg-red-50 hover:text-red-700 transition-all text-left"
            >
              <span className="material-symbols-outlined text-[#8B1A1A]">logout</span>
              Cerrar Sesión
            </button>
          </div>
          
        </aside>

        {/* Área de Contenido Dinámico */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Importar Iconos de Google (Material Symbols) */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    </div>
  );
}