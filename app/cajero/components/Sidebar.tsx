'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block p-2 rounded transition ${
      pathname === path
        ? 'bg-white text-red-900 font-semibold'
        : 'text-white hover:bg-red-700'
    }`;

  return (
    <aside
      className={`w-64 h-full bg-red-900 text-white p-4 flex flex-col absolute sm:relative transition-transform ${
        open ? 'translate-x-0' : '-translate-x-64'
      }`}
    >

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">

        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-10" />
          <h2 className="font-bold">Cajero</h2>
        </div>

        {/* BOTON CERRAR MOBILE */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-xl"
        >
          ✕
        </button>
      </div>

      {/* LINKS */}
      <nav className="space-y-2">
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
      </nav>

    </aside>
  );
}