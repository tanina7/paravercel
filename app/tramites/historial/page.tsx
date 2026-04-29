'use client';

import { useEffect, useState } from 'react';

export default function HistorialPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tramites/Historial')
      .then((res) => {
        if (!res.ok) throw new Error('Error API');
        return res.json();
      })
      .then((data) => {
        setTramites(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setTramites([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Historial de Trámites
        </h1>
        <p className="text-gray-500 mt-2">
          Registro de procedimientos archivados y finalizados exitosamente.
        </p>
      </div>

      {/* Contenedor */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            {/* HEADER */}
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-48">
                  Cód. Trámite
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Estudiante
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Tipo
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Fecha Conclusión
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  Estado
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="bg-white">

              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-gray-400">
                    Cargando historial...
                  </td>
                </tr>
              ) : tramites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <span className="material-symbols-outlined text-4xl text-gray-300">
                          history_toggle_off
                        </span>
                      </div>
                      <p className="text-gray-600 font-semibold text-lg">
                        No hay registros en el historial
                      </p>
                      <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                        Los trámites finalizados o listos para impresión aparecerán aquí.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tramites.map((t) => (
                  <tr key={t.id_tramite} className="border-b border-gray-100">

                    {/* Código */}
                    <td className="py-5 px-6 text-sm font-medium text-gray-900">
                      {t.codigo_tramite || `TR-${t.id_tramite}`}
                    </td>

                    {/* Estudiante */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {t.nombre_completo}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t.correo}
                        </span>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-5 px-6 text-sm text-gray-700">
                      {t.tipo_tramite}
                    </td>

                    {/* Fecha */}
                    <td className="py-5 px-6 text-sm text-gray-500">
                      {new Date(t.fecha_creacion).toLocaleDateString()}
                    </td>

                    {/* Estado */}
                    <td className="py-5 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.nombre_estado === 'Finalizado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.nombre_estado}
                      </span>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>

        {/* Paginación */}
        <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Mostrando {tramites.length} registros
          </span>

          <div className="flex gap-2">
            <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              Anterior
            </button>
            <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              Siguiente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}