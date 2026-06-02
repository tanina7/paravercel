'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react'; // AÑADIDO: Importamos el generador de QR

export default function HistorialPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  
  // AÑADIDO: Estado para controlar la ventana flotante del QR
  const [qrSeleccionado, setQrSeleccionado] = useState<{codigo: string, url: string} | null>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin); // Obtenemos la URL de tu servidor

    fetch('/api/historial')
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
        return JSON.parse(text);
      })
      .then((data) => setTramites(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("ERROR EN FETCH:", err);
        setTramites([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const tramitesFiltrados = tramites.filter((t) => {
    if (!busqueda.trim()) return true;

    const query = busqueda.trim().toLowerCase();
    
    // Armamos el código completo para que el buscador también lo encuentre
    const anio = new Date(t.fecha_creacion).getFullYear();
    const codigoCompleto = `UV-${anio}-${t.codigo_tramite}`.toLowerCase();
    
    const estudiante = String(t.nombre_completo || '').toLowerCase();
    const ci = String(t.ci || '').toLowerCase();
    const carrera = String(t.carrera || '').toLowerCase();

    return (
      codigoCompleto.includes(query) ||
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
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Código de Verificación</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Estudiante / Datos</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Información Académica</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos del Trámite</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Estado</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Acción</th>
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
                  let documentosParseados = [];
                  if (typeof t.archivos === 'string') {
                     try { documentosParseados = JSON.parse(t.archivos); } catch(e) {}
                  } else if (Array.isArray(t.archivos)) {
                     documentosParseados = t.archivos;
                  }

                  const documentosLimpios = documentosParseados.filter((doc: any) => doc && doc.id_archivo);

                  const requisitosEstudiante = documentosLimpios.filter((doc: any) => {
                    const tipo = doc.tipo_archivo?.toLowerCase() || '';
                    return tipo.includes('carta') || tipo.includes('fotocopia') || tipo.includes('carnet') || tipo.includes('solvencia');
                  });

                  const documentosOficiales = documentosLimpios.filter((doc: any) => !requisitosEstudiante.includes(doc));

                  // 🔥 ARMAMOS EL CÓDIGO OFICIAL COMPLETO 🔥
                  const anioCreacion = new Date(t.fecha_creacion).getFullYear();
                  const codigoOficialCompleto = `UV-${anioCreacion}-${t.codigo_tramite}`;
                  const urlValidacion = `${baseUrl}/verificar/${codigoOficialCompleto}`;

                  return (
                    <tr key={t.id_tramite} className="hover:bg-gray-50 transition-colors">

                      {/* Código con botón QR */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                            {codigoOficialCompleto}
                          </span>
                          <button 
                            onClick={() => setQrSeleccionado({ codigo: codigoOficialCompleto, url: urlValidacion })}
                            className="text-gray-400 hover:text-[#8B1A1A] hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                            title="Ver Código QR de Autenticidad"
                          >
                            <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                          </button>
                        </div>
                      </td>

                      {/* Estudiante */}
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

                      {/* Académica */}
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
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          {documentosOficiales.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-widest">Documentos Oficiales</p>
                              <div className="flex flex-wrap gap-1.5">
                                {documentosOficiales.map((doc: any) => (
                                  <a
                                    key={doc.id_archivo}
                                    href={doc.archivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-[#8B1A1A] hover:text-white text-[#8B1A1A] px-2.5 py-1 rounded-md text-[11px] font-bold border border-red-100 transition-colors shadow-sm"
                                    title={`Ver ${doc.tipo_archivo}`}
                                  >
                                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                                    <span className="max-w-[100px] truncate">{doc.tipo_archivo}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {requisitosEstudiante.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-gray-100">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Expediente Inicial</p>
                              <div className="flex flex-wrap gap-1.5">
                                {requisitosEstudiante.map((doc: any) => (
                                  <a
                                    key={doc.id_archivo}
                                    href={doc.archivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-medium border border-gray-200 transition-colors"
                                    title={`Ver ${doc.tipo_archivo}`}
                                  >
                                    <span className="material-symbols-outlined text-[12px]">description</span>
                                    <span className="max-w-[80px] truncate">{doc.tipo_archivo}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {documentosLimpios.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Sin documentos archivados</span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Finalizado
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="py-4 px-6 text-center">
                        <Link
                          href={`/tramites/detalle/${t.id_tramite}`}
                          className="text-[#8B1A1A] hover:text-[#6b1414] hover:bg-red-50 p-2 rounded-lg font-bold text-sm inline-flex items-center gap-1 transition-colors"
                        >
                          Detalles
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

      {/* ========================================================
          MODAL FLOTANTE DEL CÓDIGO QR 
      ======================================================== */}
      {qrSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center relative animate-in zoom-in-95 duration-200">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setQrSeleccionado(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <span className="material-symbols-outlined block">close</span>
            </button>
            
            {/* Contenido */}
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-green-600 text-2xl">verified</span>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-1 text-center">Escaneo de Verificación</h3>
            <p className="text-sm text-gray-500 mb-6 text-center leading-relaxed">
              Escanea este código con la cámara de tu celular para validar la autenticidad del documento.
            </p>
            
            {/* Caja del QR */}
            <div className="bg-white p-5 border-2 border-dashed border-gray-200 rounded-2xl shadow-sm mb-6">
              <QRCodeSVG value={qrSeleccionado.url} size={200} level={"H"} />
            </div>
            
            {/* Código Alfanumérico */}
            <div className="bg-gray-50 w-full rounded-xl p-3 text-center border border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Código Único</p>
              <p className="font-mono text-sm font-bold text-gray-800">
                {qrSeleccionado.codigo}
              </p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}