'use client'
import { useEffect, useState } from 'react';

export default function DashboardCards() {
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobados: 0,
    rechazados: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/biblioteca/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error stats:', error);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

      <div className="bg-white p-4 rounded-xl shadow border-l-4 border-yellow-500">
        <h2 className="text-sm text-gray-500">Pendientes</h2>
        <p className="text-2xl font-bold text-gray-800">{stats.pendientes}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-600">
        <h2 className="text-sm text-gray-500">Aprobados</h2>
        <p className="text-2xl font-bold text-gray-800">{stats.aprobados}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-600">
        <h2 className="text-sm text-gray-500">Rechazados</h2>
        <p className="text-2xl font-bold text-gray-800">{stats.rechazados}</p>
      </div>

    </div>
  );
}