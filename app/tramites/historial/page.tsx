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

  // 🔍 FILTRO ARREGLADO (BUSCA POR CÓDIGO, NOMBRE, CI O CARRERA)
  const tramitesFiltrados = tramites.filter((t) => {
    if (!busqueda.trim()) return true;

    const query = busqueda.trim().toLowerCase();

    const codigo = String(t.codigo_tramite || `TR-${t.id_tramite}`).toLowerCase();
    const estudiante = String(t.nombre_completo || '').toLowerCase();
    const ci = String(t.ci || '').toLowerCase();
    const carrera = String(t.carrera || '').toLowerCase();

    return (
      codigo.includes(query) ||
      estudiante.includes(query) ||
      ci.includes(query) ||
      carrera.includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historial de Trámites
          </h1>
          <p className="text-gray-500 mt-2">
            Registro de procedimientos archivados y finalizados.
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full md:w-[22rem]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 text-sm">search</span>
          </div>
          <input
            type="text"
            placeholder="Buscar por código, nombre, CI o carrera..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] outline-none transition-all"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            {/* HEAD */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Estudiante / Datos
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Información Académica
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Documentos
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                  Estado
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                  Acción
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-200 text-sm">

              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-3xl text-[#8B1A1A]">sync</span>
                      <p>Cargando historial...</p>
                    </div>
                  </td>
                </tr>
              ) : tramitesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                      <p>No se encontraron registros</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tramitesFiltrados.map((t) => {
                  // --- LÓGICA PARA PARSEAR DOCUMENTOS ---
                  let documentosParseados = [];
                  if (typeof t.archivos === 'string') {
                     try { documentosParseados = JSON.parse(t.archivos); } catch(e) {}
                  } else if (Array.isArray(t.archivos)) {
                     documentosParseados = t.archivos;
                  }

                  // Limpiamos los que vengan nulos por culpa del COALESCE de MySQL
                  const documentosLimpios = documentosParseados.filter((doc: any) => doc && doc.id_archivo);

                  return (
                    <tr key={t.id_tramite} className="hover:bg-gray-50 transition-colors">

                      {/* Código */}
                      <td className="py-4 px-6 font-mono font-bold text-gray-900">
                        {t.codigo_tramite || `TR-${t.id_tramite}`}
                      </td>

                      {/* Estudiante (Nombre, CI, Correo agrupados) */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            {t.nombre_completo}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded border border-gray-200">
                              CI: {t.ci || 'N/A'}
                            </span>
                            <span className="text-gray-500 truncate max-w-[150px]" title={t.correo}>
                              {t.correo || 'Sin correo'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Información Académica (Sede y Carrera) */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                            <span className="material-symbols-outlined text-[13px]">domain</span>
                            {t.sede || t.subsede || 'Sede Central'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-gray-600 text-[11px] font-medium max-w-[180px] truncate" title={t.carrera}>
                            <span className="material-symbols-outlined text-[13px] text-gray-400">school</span>
                            {t.carrera || 'No especificada'}
                          </span>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {new Date(t.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Documentos */}
                      <td className="py-4 px-6">
                        {documentosLimpios.length > 0 ? (
                          <div className="flex flex-wrap gap-2 max-w-[200px]">
                            {documentosLimpios.map((doc: any) => (
                              <a
                                key={doc.id_archivo}
                                href={doc.archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-[11px] font-medium border border-gray-200 transition-colors"
                                title={`Ver ${doc.tipo_archivo}`}
                              >
                                <span className="material-symbols-outlined text-[14px] text-[#8B1A1A]">
                                  {doc.tipo_archivo?.toLowerCase().includes('pdf') ? 'picture_as_pdf' : 'description'}
                                </span>
                                <span className="max-w-[60px] truncate">{doc.tipo_archivo}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin documentos</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Finalizado
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="py-4 px-6 text-center">
                        <Link
                          href={`/tramites/detalle/${t.id_tramite}`}
                          className="text-[#8B1A1A] hover:text-[#6b1414] hover:underline font-bold text-sm inline-flex items-center gap-1 transition-colors"
                        >
                          Ver detalles
                          <span className="material-symbols-outlined text-[16px]">arrow_forward_ios</span>
                        </Link>
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t border-gray-200 flex justify-between items-center">
          <span>Mostrando <span className="font-bold text-gray-900">{tramitesFiltrados.length}</span> registros</span>
        </div>
      </div>
    </div>
  );
}