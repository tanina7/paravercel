'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HistorialPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetch('/api/tramites/historial')
      .then(async (res) => {
        const text = await res.text();
        console.log("RESPUESTA CRUDA DEL SERVIDOR:", text);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${text}`);
        }

        return JSON.parse(text);
      })
      .then((data) => {
        setTramites(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("ERROR EN FETCH:", err);
        setTramites([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔍 FILTRO
  const tramitesFiltrados = tramites.filter((t) => {
    const query = busqueda.toLowerCase();
    const codigo = (t.codigo_tramite || `TR-${t.id_tramite}`).toLowerCase();
    const estudiante = (t.nombre_completo || '').toLowerCase();
    const tipo = (t.tipo_tramite || 'sin tipo').toLowerCase();

    return (
      codigo.includes(query) ||
      estudiante.includes(query) ||
      tipo.includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historial de Trámites
          </h1>
          <p className="text-gray-500 mt-2">
            Registro de procedimientos archivados y finalizados.
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código o estudiante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] shadow-sm bg-white"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            {/* HEAD */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase">Código</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase">Estudiante</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase">Tipo</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase">Fecha</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase text-center">Estado</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase text-center">Acción</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    Cargando...
                  </td>
                </tr>
              ) : tramitesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    No hay resultados
                  </td>
                </tr>
              ) : (
                tramitesFiltrados.map((t) => (
                  <tr key={t.id_tramite} className="hover:bg-gray-50">

                    {/* Código */}
                    <td className="py-4 px-6 font-mono font-bold">
                      {t.codigo_tramite || `TR-${t.id_tramite}`}
                    </td>

                    {/* Estudiante */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold">
                          {t.nombre_completo}
                        </div>
                        <div className="text-xs text-gray-400">
                          {t.correo || 'Sin correo'}
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-4 px-6">
                      {t.tipo_tramite || 'Sin tipo'}
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(t.fecha_creacion).toLocaleDateString()}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-green-600 text-xs font-bold">
                        Finalizado
                      </span>
                    </td>

                    {/* Acción */}
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/tramites/revisar/${t.id_tramite}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 text-sm text-gray-500 border-t">
          Mostrando {tramitesFiltrados.length} registros
        </div>
      </div>
    </div>
  );
}