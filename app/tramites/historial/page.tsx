'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HistorialPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetch('/api/historial')
      .then(async (res) => {
        const text = await res.text();

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

  // 🔍 FILTRO ARREGLADO
  const tramitesFiltrados = tramites.filter((t) => {
    if (!busqueda.trim()) return true;

    const query = busqueda.trim().toLowerCase();

    const codigo = String(t.codigo_tramite || `TR-${t.id_tramite}`).toLowerCase();
    const estudiante = String(t.nombre_completo || '').toLowerCase();

    return (
      codigo.includes(query) ||
      estudiante.includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historial de Trámites
          </h1>
          <p className="text-gray-500 mt-2">
            Registro de procedimientos archivados y Patatas y  funcionemrd.
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl text-sm text-gray-900 bg-white"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">

            {/* HEAD */}
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase">
                  Código
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase">
                  Estudiante
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase">
                  Fecha
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase text-center">
                  Estado
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase text-center">
                  Acción
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y">

              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    Cargando...
                  </td>
                </tr>
              ) : tramitesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    No hay resultados
                  </td>
                </tr>
              ) : (
                tramitesFiltrados.map((t) => (
                  <tr key={t.id_tramite} className="hover:bg-gray-50">

                    {/* Código */}
                    <td className="py-4 px-6 font-mono font-bold text-black">
                      {t.codigo_tramite || `TR-${t.id_tramite}`}
                    </td>

                    {/* Estudiante */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {t.nombre_completo}
                        </div>
                        <div className="text-xs text-gray-400">
                          {t.correo || 'Sin correo'}
                        </div>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(t.fecha_creacion).toLocaleDateString()}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-green-600 font-semibold text-sm">
                        Finalizado
                      </span>
                    </td>

                    {/* Acción */}
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/tramites/detalle/${t.id_tramite}`}
                        className="text-blue-600 hover:underline font-medium"
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