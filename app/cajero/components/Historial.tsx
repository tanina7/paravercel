'use client'
import { useEffect, useState } from 'react';

export default function Historial() {
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cajero/historial');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const text = await res.text();
      const json = text ? JSON.parse(text) : [];
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setData([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Historial de Movimientos</h1>
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg overflow-hidden">
          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">ID Trámite</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Comentario</th>
              <th className="p-3 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={`${item.id_tramite}-${index}`} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">#{item.id_tramite}</td>
                  <td className="p-3">{item.nombre_completo || 'Sin nombre'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.nombre_estado === 'Pagado'
                        ? 'bg-green-100 text-green-800'
                        : item.nombre_estado === 'Rechazado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.nombre_estado === 'Revision Tecnica' ? 'Aprobado' : item.nombre_estado}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 italic">{item.comentario || 'Sin observaciones'}</td>
                  <td className="p-3 text-sm text-gray-500">{item.fecha ? new Date(item.fecha).toLocaleString('es-BO') : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">No hay historial disponible</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}