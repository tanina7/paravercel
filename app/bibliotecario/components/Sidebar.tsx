import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-red-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Bibliotecario</h2>
      <Link href="/bibliotecario" className="block mb-2 hover:bg-red-700 p-2 rounded">
        Solicitudes
      </Link>
      <Link href="/bibliotecario/historial" className="block hover:bg-red-700 p-2 rounded">
        Historial
      </Link>
    </div>
  );
}