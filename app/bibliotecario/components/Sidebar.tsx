'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ close }: any) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block p-2 rounded transition ${
      pathname === path
        ? 'bg-white text-red-900 font-semibold'
        : 'text-white hover:bg-red-700'
    }`;

  return (
    <div className="w-64 h-full bg-red-900 text-white p-4 flex flex-col">

      {/* HEADER SIDEBAR */}
      <div className="mb-6 flex justify-between items-center">

        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-10" />
          <h2 className="font-bold">Bibliotecario</h2>
        </div>

        {/* BOTON CERRAR MOBILE */}
        <button
          onClick={close}
          className="md:hidden text-xl"
        >
          ✕
        </button>
      </div>

      {/* LINKS */}
      <nav className="space-y-2">
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

    </div>
  );
}