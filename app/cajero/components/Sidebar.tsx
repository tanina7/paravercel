'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ close }: any) {
  const pathname = usePathname();
  const linkClass = (path: string) =>
    `block p-2 rounded transition ${
      pathname === path ? 'bg-white text-red-900 font-semibold' : 'text-white hover:bg-red-700'
    }`;

  return (
    <div className="w-64 h-full bg-red-900 text-white p-4 flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-10" />
          <h2 className="font-bold">Cajero</h2>
        </div>
        <button onClick={close} className="md:hidden text-xl">✕</button>
      </div>
      <nav className="space-y-2">
        <Link href="/cajero" className={linkClass('/cajero')} onClick={close}>📄 Trámites</Link>
        <Link href="/cajero/historial" className={linkClass('/cajero/historial')} onClick={close}>📜 Historial</Link>
      </nav>
    </div>
  );
}