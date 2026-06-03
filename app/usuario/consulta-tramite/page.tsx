'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../components/Header';

interface EstadoTramite {
  id_tramite: number;
  id_solicitud: number;
  nombre_tramite: string;
  estado: string;
  fechaCreacion: string;
  codigoTramite: string;
  costo: number;
  id_estado: number;
}

const estadoConfig: Record<string, { label: string; color: string; icono: string }> = {
  '1': { label: 'Recibido', color: 'bg-blue-100 text-blue-800 border-blue-300', icono: '📋' },
  '2': { label: 'Verificando Solvencia', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icono: '⏳' },
  '3': { label: 'Revisión Técnica', color: 'bg-purple-100 text-purple-800 border-purple-300', icono: '🔍' },
  '4': { label: 'Pago Pendiente', color: 'bg-orange-100 text-orange-800 border-orange-300', icono: '💳' },
  '5': { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-300', icono: '✓' },
  '6': { label: 'Listo para Impresión', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icono: '📄' },
  '7': { label: 'Finalizado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icono: '🎉' },
  '8': { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-300', icono: '❌' },
};

export default function ConsultaTramitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tramite, setTramite] = useState<EstadoTramite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const codigo = searchParams.get('codigo');
    
    if (!codigo) {
      setError('No se proporcionó código de trámite');
      setLoading(false);
      return;
    }

    const consultarTramite = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tramites/${codigo}`);
        const data = await response.json();

        if (response.status === 404 || data.error) {
          setError('Trámite no encontrado. Verifica el código ingresado.');
          return;
        }

        setTramite(data);
        setError(null);
      } catch (err) {
        setError('Error al consultar el trámite. Intenta más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    consultarTramite();
  }, [searchParams]);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const getEstadoConfig = (idEstado: number | null | undefined) => {
    const key = idEstado !== null && idEstado !== undefined ? idEstado.toString() : '';
    return estadoConfig[key] || { 
      label: 'Desconocido', 
      color: 'bg-gray-100 text-gray-800 border-gray-300', 
      icono: '❓' 
    };
  };

  const handleDescargarFactura = async (id_solicitud: number) => {
    try {
      const response = await fetch(`/api/usuario/descargar-documento-factura?id_solicitud=${id_solicitud}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al descargar la factura');
        return;
      }

      const contentDisposition = response.headers.get('content-disposition');
      let filename = `factura-${id_solicitud}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

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

  const handleVerFactura = async (id_solicitud: number) => {
    try {
      const response = await fetch(`/api/usuario/descargar-documento-factura?id_solicitud=${id_solicitud}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al cargar la factura');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error abriendo factura:', error);
      alert('Error al abrir la factura');
    }
  };

  const handleImprimirFactura = async (id_solicitud: number) => {
    try {
      const response = await fetch(`/api/usuario/descargar-documento-factura?id_solicitud=${id_solicitud}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al cargar la factura para imprimir');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Crear un iframe temporal para imprimir
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(iframe);
        }, 1000);
      };
      
      document.body.appendChild(iframe);
    } catch (error) {
      console.error('Error imprimiendo factura:', error);
      alert('Error al imprimir la factura');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin">
              <svg className="w-16 h-16 text-[#8B1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-black font-medium">Cargando información del trámite...</p>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 mb-2">No se encontró el trámite</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      href="/usuario/landing"
                      className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-center"
                    >
                      Volver a intentar
                    </Link>
                    <Link 
                      href="/usuario/SeleccionTramites"
                      className="px-6 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition-colors text-center"
                    >
                      Ver nuevos trámites
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : tramite ? (
          <div className="space-y-8">
            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415]"></div>
              
              <div className="p-8">
                {/* Título */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tramite.nombre_tramite}</h1>
                </div>

                {/* Estado */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-l-4 border-[#8B1A1A]">
                  <h2 className="text-sm font-semibold text-black uppercase tracking-wider mb-3">Estado Actual</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{getEstadoConfig(tramite.id_estado).icono}</span>
                    <div>
                      <p className={`text-2xl font-bold ${getEstadoConfig(tramite.id_estado).color.split(' ')[2]}`}>
                        {getEstadoConfig(tramite.id_estado).label}
                      </p>
                      <div className={`inline-block mt-2 px-4 py-1 rounded-full border-2 ${getEstadoConfig(tramite.id_estado).color}`}>
                        <span className="font-semibold text-sm">Estado {tramite.id_estado}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información General */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wider mb-2">Costo</h3>
                    <p className="text-2xl font-bold text-purple-700">${tramite.costo.toLocaleString('es-CO')}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wider mb-2">Fecha de Solicitud</h3>
                    <p className="text-lg font-semibold text-green-700">
                      {new Date(tramite.fechaCreacion).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  
                </div>

                {/* Línea de tiempo de estados */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Progreso del Trámite</h3>
                  <div className="space-y-4">
                    {Object.entries(estadoConfig).map(([id, config]) => (
                      <div key={id} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          parseInt(id) <= tramite.id_estado 
                            ? 'bg-[#8B1A1A] text-white' 
                            : 'bg-gray-200 text-black'
                        }`}>
                          {parseInt(id)}
                        </div>
                        <div className={`flex-1 font-semibold ${
                          parseInt(id) <= tramite.id_estado 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        }`}>
                          {config.label}
                        </div>
                        {parseInt(id) === tramite.id_estado && (
                          <span className="inline-block px-3 py-1 bg-[#8B1A1A] text-white text-xs font-bold rounded-full">
                            Actual
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones - Factura */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Descargas de Factura</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleVerFactura(tramite.id_solicitud)}
                  className="flex-1 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 hover:shadow-lg transition-all duration-300 active:scale-95"
                  title="Ver vista previa de la factura"
                >
                  Vista Previa
                </button>
                <button
                  onClick={() => handleDescargarFactura(tramite.id_solicitud)}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-300 active:scale-95"
                  title="Descargar factura del trámite"
                >
                  Descargar
                </button>
                <button
                  onClick={() => handleImprimirFactura(tramite.id_solicitud)}
                  className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 active:scale-95"
                  title="Imprimir factura"
                >
                  Imprimir
                </button>
              </div>
            </div>

            {/* Acciones - Trámites */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Navegación</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/usuario/landing"
                  className="flex-1 px-6 py-3 rounded-lg bg-[#8B1A1A] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 text-center"
                >
                  Consultar Otro Trámite
                </Link>
                <Link
                  href="/usuario/SeleccionTramites"
                  className="flex-1 px-6 py-3 rounded-lg bg-gray-200 text-black font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 text-center"
                >
                  Solicitar Nuevo Trámite
                </Link>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h3 className="font-bold text-blue-900 mb-2">💡 Información</h3>
              <p className="text-blue-800 text-sm">
                Si tienes dudas sobre el estado de tu trámite o necesitas más información, 
                <Link href="/" className="font-semibold hover:underline"> contacta con el departamento de admisiones</Link>.
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 border-t border-gray-800">
        <p className="text-sm">© 2025 Universidad del Valle - Departamento de Admisiones. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
