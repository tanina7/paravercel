'use client'
import { useEffect, useState } from 'react';

interface Stats {
  revision: number;
  pagado: number;
  rechazado: number;
}

export default function DashboardCards() {
  const [stats, setStats] = useState<Stats>({
    revision: 0,
    pagado: 0,
    rechazado: 0
  });

  useEffect(() => {
    fetch('/api/cajero/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error stats:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

      {/* EN REVISION */}
      <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-500 hover:shadow-lg transition">
        <h2 className="text-sm text-gray-500">En Revisión</h2>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {stats.revision}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Trámites pendientes de validación
        </p>
      </div>

      {/* PAGADOS */}
      <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500 hover:shadow-lg transition">
        <h2 className="text-sm text-gray-500">Pagados</h2>
        <p className="text-3xl font-bold text-green-600 mt-2">
          {stats.pagado}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Pagos confirmados correctamente
        </p>
      </div>

      {/* RECHAZADOS */}
      <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-red-500 hover:shadow-lg transition">
        <h2 className="text-sm text-gray-500">Rechazados</h2>
        <p className="text-3xl font-bold text-red-600 mt-2">
          {stats.rechazado}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Pagos o trámites rechazados
        </p>
      </div>

    </div>
  );
}