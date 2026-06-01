'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TramitesPage() {

  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState(''); // Estado para el buscador

  // ==========================================
  // FETCH REAL DESDE API
  // ==========================================
  useEffect(() => {
    fetch('/api/tramites/solicitudes')
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

  // ==========================================
  // FILTRO DE BÚSQUEDA (Por Nombre o CI)
  // ==========================================
  const tramitesFiltrados = tramites.filter((t) => {
    const termino = busqueda.toLowerCase();
    const nombre = t.nombre_completo?.toLowerCase() || '';
    const ci = t.ci?.toLowerCase() || '';
    return nombre.includes(termino) || ci.includes(termino);
  });

  // ==========================================
  // CONTADORES DINÁMICOS
  // ==========================================
  const nuevasSolicitudes = tramites.filter(
    (t) =>
      t.nombre_estado === 'Pagado' ||
      t.nombre_estado === 'Aprobado Biblioteca'
  ).length;

  const enProceso = tramites.filter(
    (t) =>
      t.nombre_estado === 'En Proceso' ||
      t.nombre_estado === 'Derivado a Tramites'
  ).length;

  const completados = tramites.filter(
    (t) => t.nombre_estado === 'Completado'
  ).length;

  const indicators = [
    {
      label: 'Nuevas Solicitudes',
      value: nuevasSolicitudes.toString(),
      icon: 'mail',
    },
    {
      label: 'En Proceso',
      value: enProceso.toString(),
      icon: 'sync',
    },
    {
      label: 'Completados',
      value: completados.toString(),
      icon: 'done_all',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ==========================================
          TARJETAS
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {indicators.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#8B1A1A] flex justify-between items-center transition-transform hover:-translate-y-1"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {item.label}
              </p>

              <p className="text-3xl font-black text-[#8B1A1A] mt-1">
                {item.value}
              </p>
            </div>

            <span className="material-symbols-outlined text-4xl text-gray-200">
              {item.icon}
            </span>
          </div>
        ))}
      </div>

      {/* ==========================================
          HEADER TABLA
      ========================================== */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">
            Trámites Solicitados
          </h2>

          <p className="text-gray-500 mt-1 text-sm">
            Lista de estudiantes pendientes de revisión
          </p>
        </div>

        {/* Buscador visual (AHORA FUNCIONAL) */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">
            search
          </span>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o CI..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] w-64"
          />
        </div>
      </div>

      {/* ==========================================
          TABLA
      ========================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            {/* HEADER */}
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-200">
                <th className="py-4 px-6">Estudiante</th>

                <th className="py-4 px-6 text-center">
                  Carrera y Sede
                </th>

                <th className="py-4 px-6 text-center">
                  Tipo de Trámite
                </th>

                <th className="py-4 px-6 text-center">
                  Estado
                </th>

                <th className="py-4 px-6 text-center">
                  Acción
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-24 text-center text-gray-400"
                  >
                    Cargando trámites...
                  </td>
                </tr>

              ) : tramitesFiltrados.length === 0 ? (

                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">

                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <span className="material-symbols-outlined text-4xl text-gray-300">
                          {busqueda ? 'search_off' : 'folder_open'}
                        </span>
                      </div>

                      <p className="text-gray-600 font-semibold text-lg">
                        {busqueda ? 'No se encontraron resultados' : 'No hay trámites'}
                      </p>

                      <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                        {busqueda ? `Nadie coincide con "${busqueda}".` : 'Los trámites aparecerán aquí cuando existan registros.'}
                      </p>

                    </div>
                  </td>
                </tr>

              ) : (

                tramitesFiltrados.map((tramite) => (

                  <tr
                    key={tramite.id_tramite}
                    className="hover:bg-gray-50 transition-colors group"
                  >

                    {/* ESTUDIANTE (Nombre, CI y Correo) */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900 text-sm">
                        {tramite.nombre_completo}
                      </p>
                      
                      <p className="text-gray-600 text-[11px] mt-1 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded border border-gray-200">
                        CI: {tramite.ci || 'Sin registrar'}
                      </p>

                      <p className="text-gray-400 text-xs mt-1 block">
                        {tramite.correo}
                      </p>
                    </td>

                    {/* CARRERA Y SEDE */}
                    <td className="py-4 px-6 text-center">
                      <p className="text-gray-700 text-sm font-medium">
                        {tramite.carrera || 'Sin carrera'}
                      </p>

                      <p className="text-gray-500 text-xs mt-1">
                        Sede: {tramite.sede || '---'}
                      </p>
                    </td>

                    {/* TIPO */}
                    <td className="py-4 px-6 text-center">
                      <p className="text-gray-700 text-sm font-medium">
                        {tramite.tipo_tramite}
                      </p>
                    </td>

                    {/* ESTADO */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                        {tramite.nombre_estado}
                      </span>
                    </td>

                    {/* ACCIÓN */}
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/tramites/revisar/${tramite.id_tramite}`}
                        className="inline-flex items-center justify-center bg-[#8B1A1A] hover:bg-[#6b1414] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        Ver Trámite
                      </Link>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Mostrando {tramitesFiltrados.length} registros
          </span>
        </div>

      </div>
    </div>
  );
}