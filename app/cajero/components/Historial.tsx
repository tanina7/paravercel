'use client';

import { useEffect, useState } from 'react';

type Historial = {
  id_tramite: number;
  nombre_completo: string;
  correo: string;
  nombre_estado: string;
  comentario: string;
  fecha: string;
};

export default function Historial({ endpoint }: { endpoint: string }) {
  const [data, setData] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Error al cargar historial');

      const json = await res.json();

      const result = Array.isArray(json)
        ? json
        : json.data || json.rows || json.result || [];

      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  if (loading) {
    return <p className="p-4 text-gray-600">Cargando historial...</p>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-600 text-white px-3 py-1 rounded mt-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">

      {/* HEADER igual al Historial2 */}
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Historial de Trámites
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg overflow-hidden">

          {/* HEADER estilo Historial2 */}
          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">ID Trámite</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Comentario</th>
              <th className="p-3 text-left">Fecha</th>
            </tr>
          </thead>

          {/* BODY estilo Historial2 */}
          <tbody className="divide-y divide-gray-200 text-gray-800">

            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={`${item.id_tramite}-${index}`}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">
                    #{item.id_tramite}
                  </td>

                  <td className="p-3">
                    {item.nombre_completo}
                  </td>

                  <td className="p-3 text-gray-600">
                    {item.correo}
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.nombre_estado === 'Pagado'
                        ? 'bg-green-100 text-green-800'
                        : item.nombre_estado === 'Rechazado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.nombre_estado}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600 italic">
                    {item.comentario || 'Sin observaciones'}
                  </td>

                  <td className="p-3 text-sm text-gray-500">
                    {new Date(item.fecha).toLocaleString('es-BO')}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  No hay historial disponible
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}