'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block p-3 rounded transition ${
      pathname === path
        ? 'bg-white text-red-900 font-semibold'
        : 'text-white hover:bg-red-700'
    }`;

  return (
    <aside
      className={`
        w-64 h-full bg-red-900 text-white
        flex flex-col
        absolute sm:relative
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-64'}
      `}
    >
      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs text-red-300 uppercase tracking-wider mb-2">
          Menú
        </p>

        <Link
          href="/cajero"
          className={linkClass('/cajero')}
          onClick={() => setOpen(false)}
        >
          💳 Trámites
        </Link>

        <Link
          href="/cajero/historial"
          className={linkClass('/cajero/historial')}
          onClick={() => setOpen(false)}
        >
          📜 Historial
        </Link>

        {/* NUEVO: PRECIOS */}
        <Link
          href="/cajero/precios"
          className={linkClass('/cajero/precios')}
          onClick={() => setOpen(false)}
        >
          🏷️ Precios de Trámites
        </Link>
      </nav>

      {/* FOOTER SUTIL */}
      <div className="p-4 border-t border-red-800">
        <div className="text-xs text-red-200 flex items-center justify-between">
          <span>Sistema Cajero</span>
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        </div>
      </div>
    </aside>
  );
}