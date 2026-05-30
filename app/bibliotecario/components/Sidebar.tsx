'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ close }: any) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block p-3 rounded transition ${
      pathname === path
        ? 'bg-white text-red-900 font-semibold'
        : 'text-white hover:bg-red-700'
    }`;

  return (
    <div className="w-64 h-full bg-red-900 text-white flex flex-col">

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs text-red-300 uppercase tracking-wider mb-2">
          Menú
        </p>

        <Link
          href="/bibliotecario"
          className={linkClass('/bibliotecario')}
          onClick={close}
        >
          📄 Solicitudes
        </Link>

        <Link
          href="/bibliotecario/historial"
          className={linkClass('/bibliotecario/historial')}
          onClick={close}
        >
          📜 Historial
        </Link>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-red-800">
        <div className="text-xs text-red-200 flex items-center justify-between">
          <span>Bibliotecario</span>
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        </div>
      </div>

    </div>
  );
}