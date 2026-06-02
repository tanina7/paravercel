'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

interface TramiteHistorial {
  id_tramite: number;
  codigo_tramite: string;
  tipo_tramite: string;
  nombre_estado: string;
  fecha_creacion: string;
  correo: string;
  nombre_completo: string;
  id_estado: number;
  id_solicitud: number;
}

const estadoConfig: Record<string, { label: string; color: string; icon: string }> = {
  'Recibido': { label: 'Recibido', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '📥' },
  'Verificando Solvencia': { label: 'Verificando', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳' },
  'Revision Tecnica': { label: 'En revisión', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🔍' },
  'Pago Pendiente': { label: 'Pago pendiente', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '💳' },
  'Pagado': { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-300', icon: '✓' },
  'Listo para Impresion': { label: 'Listo', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '🖨️' },
  'Finalizado': { label: 'Finalizado', color: 'bg-green-200 text-green-900 border-green-400', icon: '✅' },
  'Rechazado': { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-300', icon: '❌' },
};

export default function HistorialPage() {
  const router = useRouter();
  const [tramites, setTramites] = useState<TramiteHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/usuario/historial');

        if (!response.ok) {
          throw new Error('No se pudo cargar el historial');
        }

        const data = await response.json();
        setTramites(data.tramites || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    obtenerHistorial();
  }, []);

  // Manejar descarga de factura
  const handleDescargarFactura = async (id_solicitud: number) => {
    try {
      const response = await fetch(`/api/usuario/descargar-documento-factura?id_solicitud=${id_solicitud}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al descargar la factura');
        return;
      }

      // Obtener el nombre del archivo desde el header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `factura-${id_solicitud}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando factura:', error);
      alert('Error al descargar la factura');
    }
  };

  // Filtrar trámites por estado
  const tramitesFiltrados = filtroEstado
    ? tramites.filter(t => t.nombre_estado === filtroEstado)
    : tramites;

  // Obtener estados únicos
  const estados = Array.from(new Set(tramites.map(t => t.nombre_estado)));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 rounded-lg p-2 transition-all"
            >
              <span className="text-2xl">←</span>
            </button>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Historial de Trámites
              </h2>
              <p className="text-lg text-gray-100 mt-2">
                Consulta el estado de todos tus trámites solicitados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-grow py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <svg className="animate-spin h-12 w-12 text-[#8B1A1A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-black font-medium">Cargando tu historial...</p>
            </div>
          ) : tramites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-black mb-2">Sin trámites aún</h3>
              <p className="text-black mb-6">No tienes ningún trámite solicitado. ¡Inicia uno ahora!</p>
              <Link
                href="/usuario/SeleccionTramites"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-[#701515] transition-all"
              >
                <span>Solicitar Trámite</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Filter Section */}
              <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Filtrar por Estado</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroEstado('')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filtroEstado === ''
                        ? 'bg-[#8B1A1A] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({tramites.length})
                  </button>
                  {estados.map(estado => {
                    const config = estadoConfig[estado];
                    const count = tramites.filter(t => t.nombre_estado === estado).length;
                    return (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          filtroEstado === estado
                            ? 'bg-[#8B1A1A] text-white shadow-md'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        <span>{config?.icon}</span>
                        <span>{config?.label} ({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tramites List */}
              <div className="space-y-4">
                {tramitesFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-black font-medium">No hay trámites con este estado</p>
                  </div>
                ) : (
                  tramitesFiltrados.map((tramite) => {
                    const config = estadoConfig[tramite.nombre_estado];
                    return (
                      <div
                        key={tramite.id_tramite}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Tipo Trámite */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Tipo de Trámite
                              </p>
                              <p className="text-lg font-semibold text-black">{tramite.tipo_tramite}</p>
                            </div>

                            {/* Fecha */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Fecha de Solicitud
                              </p>
                              <p className="text-lg font-semibold text-black">
                                {new Date(tramite.fecha_creacion).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>

                            {/* Estado */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Estado
                              </p>
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm ${config?.color}`}>
                                <span>{config?.icon}</span>
                                <span>{config?.label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Botones de Acción */}
                          <div className="flex gap-3 pt-4 border-t border-gray-100 flex-wrap">
                            <Link
                              href={`/usuario/consulta-tramite?codigo=${encodeURIComponent(tramite.codigo_tramite)}`}
                              className="flex-1 px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg hover:bg-[#701515] transition-all flex items-center justify-center gap-2 min-w-max"
                            >
                              <span>Ver Detalles</span>
                              <span>→</span>
                            </Link>
                            <button
                              onClick={() => handleDescargarFactura(tramite.id_solicitud)}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 min-w-max"
                              title="Descargar factura del trámite"
                            >
                              <span>📄 Descargar Factura</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
