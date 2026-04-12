'use client';

import { useEffect, useState } from 'react';

type HistorialPago = {
  id_pago: number;
  id_solicitud: number;
  codigo_tramite: string;
  monto: number;
  metodo_pago: string;
  estado_pago: string;
  fecha_pago: string;
  comprobante?: string | null;
};

export default function Historial({ endpoint }: { endpoint: string }) {
  const [data, setData] = useState<HistorialPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(endpoint);

        if (!res.ok) throw new Error('Error al cargar historial');

        const json = await res.json();

        // ✅ FIX del error: asegurar array SIEMPRE
        const result = Array.isArray(json)
          ? json
          : json.data || json.rows || json.result || [];

        if (!Array.isArray(result)) {
          throw new Error('La API no devolvió un array válido');
        }

        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  if (loading) {
    return <p className="p-4 text-gray-600">Cargando historial...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-600 font-semibold">{error}</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">
        Historial de Pagos
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">

          {/* HEADER */}
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Trámite</th>
              <th className="p-3 text-left">Monto</th>
              <th className="p-3 text-left">Método</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Comprobante</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((pago) => (
                <tr key={pago.id_pago} className="hover:bg-gray-50">

                  <td className="p-3 font-semibold text-gray-700">
                    #{pago.id_pago}
                  </td>

                  <td className="p-3 text-gray-700">
                    {pago.codigo_tramite}
                  </td>

                  <td className="p-3 font-medium text-green-700">
                    Bs {pago.monto}
                  </td>

                  <td className="p-3 text-gray-600">
                    {pago.metodo_pago}
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${
                        pago.estado_pago === 'Completado'
                          ? 'bg-green-100 text-green-700'
                          : pago.estado_pago === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pago.estado_pago}
                    </span>
                  </td>

                  <td className="p-3 text-gray-500 text-sm">
                    {new Date(pago.fecha_pago).toLocaleString('es-BO')}
                  </td>

                  <td className="p-3">
                    {pago.comprobante ? (
                      <a
                        href={pago.comprobante}
                        target="_blank"
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Ver comprobante
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin archivo</span>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  No hay pagos registrados
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}