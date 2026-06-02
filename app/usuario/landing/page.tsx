'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import { useCarrito } from '@/app/usuario/context/CarritoContext';
import Header from '../components/Header';

interface TramiteQuickAccess {
  id: number;
  name: string;
  descripcion: string;
  icono: string;
  costo: number;
  requisitos: string;
}

interface HistorialEstado {
  nombre_estado: string;
  fecha: string;
  comentario?: string;
}

interface TramiteActivo {
  id_tramite: number;
  codigo_tramite: string;
  fecha_solicitud: string;
  nombre_estado: string;
  tipo_tramite: string;
  historial: HistorialEstado[];
  visto_por_usuario?: boolean;
}

const tramitesQuickAccess = [
  {
    id: 3,
    name: 'Certificado de Calificaciones',
    descripcion: 'Obtén tu certificado académico con tus calificaciones actualizadas',
    icono: '📋',
    costo: 50.00,
    requisitos: 'Consultar en oficina de trámites'
  },
  {
    id: 2,
    name: 'Extensión de Diploma y Título',
    descripcion: 'Solicita copias adicionales de tu diploma o título profesional',
    icono: '🎓',
    costo: 120.00,
    requisitos: 'Consultar en oficina de trámites'
  },
  {
    id: 4,
    name: 'Cambio de Plan de Estudios',
    descripcion: 'Homologación entre programas académicos disponibles',
    icono: '📚',
    costo: 80.00,
    requisitos: 'Consultar en oficina de trámites'
  },
  {
    id: 1,
    name: 'Cambio de Sub Sede',
    descripcion: 'Convalidación de estudios entre diferentes sedes',
    icono: '🏢',
    costo: 90.00,
    requisitos: 'Consultar en oficina de trámites'
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [codigoTramite, setCodigoTramite] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [tramitesActivos, setTramitesActivos] = useState<TramiteActivo[]>([]);
  const [loadingTramites, setLoadingTramites] = useState(true);
  const [expandedTramitesSection, setExpandedTramitesSection] = useState(false);

  const obtenerTramitesActivos = async () => {
    try {
      setLoadingTramites(true);
      const response = await fetch('/api/usuario/tramites-activos');

      if (!response.ok) {
        console.log('No hay trámites activos o error en la petición');
        setTramitesActivos([]);
      } else {
        const data = await response.json();
        setTramitesActivos(data.tramites || []);
      }
    } catch (err) {
      console.log('Error al obtener trámites activos:', err);
      setTramitesActivos([]);
    } finally {
      setLoadingTramites(false);
    }
  };

  useEffect(() => {
    obtenerTramitesActivos();

    const handleFocus = () => {
      obtenerTramitesActivos();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigoTramite.trim()) {
      alert('Por favor ingresa un código de trámite');
      return;
    }

    router.push(`/usuario/consulta-tramite?codigo=${encodeURIComponent(codigoTramite)}`);
    setCodigoTramite('');
  };

  const handleVerificarDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoVerificacion.trim()) {
      alert('Por favor ingresa el código de verificación del documento');
      return;
    }
    router.push(`/verificar/${encodeURIComponent(codigoVerificacion.trim())}`);
    setCodigoVerificacion('');
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tramitesQuickAccess.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? tramitesQuickAccess.length - 1 : prev - 1
    );
  };

  const visibleTramites = [
    tramitesQuickAccess[currentIndex],
    tramitesQuickAccess[(currentIndex + 1) % tramitesQuickAccess.length],
    tramitesQuickAccess[(currentIndex + 2) % tramitesQuickAccess.length],
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white py-20 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fadeInUp">
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                Gestiona tus trámites universitarios de forma rápida y sencilla
              </h2>
              <p className="text-lg text-gray-100 leading-relaxed">
                Plataforma digital diseñada para facilitar todos tus trámites académicos. Seguimiento en tiempo real, gestión simple y atención personalizada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/usuario/SeleccionTramites" className="px-8 py-3.5 rounded-lg font-semibold bg-white text-[#8B1A1A] hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                  <span>Ver trámites</span>
                  <span className="text-xl">→</span>
                </Link>
                <Link href="/usuario/historial" className="px-8 py-3.5 rounded-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
                  <span>📋 Mi Historial</span>
                  <span className="text-xl">→</span>
                </Link>
              </div>
            </div>

            <div className="relative h-80 sm:h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-2xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-40 h-40 animate-float">
                  <Image
                    src="/logo.png"
                    alt="Logo Univalle"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trámites Activos Section - Collapsible */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Tus Trámites Activos
              </h2>
              <p className="text-black text-lg">
                Monitorea el estado actual y el historial de tus trámites en tiempo real
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedTramitesSection(!expandedTramitesSection)}
                className="px-6 py-3 rounded-lg font-semibold bg-gray-400 text-white hover:bg-gray-500 transition-all duration-300 active:scale-95 whitespace-nowrap flex items-center gap-2"
              >
                <span>{expandedTramitesSection ? '▼' : '▶'}</span>
                {expandedTramitesSection ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                onClick={obtenerTramitesActivos}
                disabled={loadingTramites || !expandedTramitesSection}
                className="px-6 py-3 rounded-lg font-semibold bg-[#8B1A1A] text-white hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
              >
                <span>🔄</span>
                {loadingTramites ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {expandedTramitesSection && (
            <>
              {loadingTramites ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
                </div>
              ) : tramitesActivos.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes trámites activos</h3>
                  <p className="text-black mb-6">
                    Todos tus trámites han sido finalizados o rechazados.
                  </p>
                  <Link
                    href="/usuario/SeleccionTramites"
                    className="inline-block px-8 py-3 rounded-lg font-semibold bg-[#8B1A1A] text-white hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
                  >
                    Iniciar nuevo trámite
                  </Link>
                </div>
              ) : (
                <div className="grid gap-8">
                  {tramitesActivos.map((tramite) => (
                    <TramiteTimelineCard key={tramite.id_tramite} tramite={tramite} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* =========================================================
          NUEVO APARTADO: VERIFICAR DOCUMENTO
      ========================================================= */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-green-600 mb-4">verified</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Verificar Autenticidad de Documento
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Comprueba la validez legal de cualquier certificado emitido por UNIVALLE ingresando su código de seguridad alfanumérico.
            </p>

            <form onSubmit={handleVerificarDocumento} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Ej: UV-2026-TRM-123456"
                value={codigoVerificacion}
                onChange={(e) => setCodigoVerificacion(e.target.value)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-green-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none transition-colors duration-300 placeholder-gray-400 font-mono font-bold text-gray-800"
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined">search</span>
                Validar Documento
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Access Carousel Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Accesos Rápidos
            </h2>
            <p className="text-gray-600 text-lg">
              Inicia rápidamente los trámites más solicitados
            </p>
          </div>

          <div className="relative">
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
              {visibleTramites.map((tramite, idx) => (
                <TramiteCard key={`${tramite.id}-${idx}`} tramite={tramite} index={idx} />
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative flex items-center justify-center">
              <div className="w-full max-w-sm">
                <TramiteCard tramite={tramitesQuickAccess[currentIndex]} index={0} />
              </div>
            </div>

            {/* Carousel Navigation */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-gray-200 hover:bg-[#8B1A1A] text-gray-700 hover:text-white transition-all duration-300"
              >
                ←
              </button>
              <div className="flex gap-2 items-center">
                {tramitesQuickAccess.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#8B1A1A] w-8' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-gray-200 hover:bg-[#8B1A1A] text-gray-700 hover:text-white transition-all duration-300"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Informational Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#f5f5f5] to-[#fafafa] border-y-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border-l-4 border-[#8B1A1A]">
            <div className="flex items-start gap-6">
              <div className="text-5xl flex-shrink-0">⚠️</div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Requisito importante para tus trámites
                </h3>
                <p className="text-black text-lg leading-relaxed mb-4">
                  Para poder realizar cualquier trámite universitario a través de esta plataforma,{' '}
                  <span className="font-bold text-[#8B1A1A]">
                    debes no tener deudas pendientes
                  </span>{' '}
                  con la Universidad del Valle.
                </p>
                <p className="text-black">
                  Si tienes dudas sobre tu situación financiera, contacta con la Oficina de Admisiones y Registro o el Departamento de Cartera.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B1A1A] to-[#6B1415] flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <h3 className="text-lg font-bold text-white">Trámites Univalle</h3>
              </div>
              <p className="text-sm text-gray-400">
                Plataforma digital de la Universidad del Valle para la gestión de trámites académicos.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/usuario/historial" className="hover:text-[#8B1A1A] transition-colors duration-300">
                    Mi Historial de Trámites
                  </a>
                </li>
                <li>
                  <a href="/usuario/historial" className="hover:text-[#8B1A1A] transition-colors duration-300">
                    Consultar Estado
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8B1A1A] transition-colors duration-300">
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:tramites@univalle.edu.co"
                    className="hover:text-[#8B1A1A] transition-colors duration-300"
                  >
                    tramites@univalle.edu.co
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+5723212323"
                    className="hover:text-[#8B1A1A] transition-colors duration-300"
                  >
                    +57 (3) 212-3323
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Síguenos</h4>
              <div className="flex gap-4">
                {['f', 'i', 't'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#8B1A1A] transition-colors duration-300"
                  >
                    {social === 'f' && '📘'}
                    {social === 'i' && '📷'}
                    {social === 't' && '𝕏'}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              © 2026 Universidad del Valle. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-[#8B1A1A] transition-colors duration-300">
                Privacidad
              </a>
              <a href="#" className="hover:text-[#8B1A1A] transition-colors duration-300">
                Términos
              </a>
              <a href="#" className="hover:text-[#8B1A1A] transition-colors duration-300">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-slideInDown {
          animation: slideInDown 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

interface TramiteCardProps {
  tramite: TramiteQuickAccess;
  index: number;
}

function TramiteTimelineCard({ tramite }: { tramite: TramiteActivo }) {
  const [expanded, setExpanded] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const todosLosEstados = [
    { id: 1, nombre: 'Recibido', icon: '📥', color: 'bg-blue-50', borderColor: 'border-blue-300', textColor: 'text-blue-700' },
    { id: 2, nombre: 'Verificando Solvencia', icon: '⏳', color: 'bg-yellow-50', borderColor: 'border-yellow-300', textColor: 'text-yellow-700' },
    { id: 3, nombre: 'Revision Tecnica', icon: '🔍', color: 'bg-purple-50', borderColor: 'border-purple-300', textColor: 'text-purple-700' },
    { id: 4, nombre: 'Pago Pendiente', icon: '💳', color: 'bg-orange-50', borderColor: 'border-orange-300', textColor: 'text-orange-700' },
    { id: 5, nombre: 'Pagado', icon: '✓', color: 'bg-green-50', borderColor: 'border-green-300', textColor: 'text-green-700' },
    { id: 6, nombre: 'Listo para Impresion', icon: '🖨️', color: 'bg-indigo-50', borderColor: 'border-indigo-300', textColor: 'text-indigo-700' },
    { id: 7, nombre: 'Finalizado', icon: '✅', color: 'bg-green-100', borderColor: 'border-green-400', textColor: 'text-green-800' },
    { id: 8, nombre: 'Rechazado', icon: '❌', color: 'bg-red-50', borderColor: 'border-red-300', textColor: 'text-red-700' },
  ];

  const estadosCompletados = new Set(
    tramite.historial.map((h) => h.nombre_estado)
  );

  const estadoActualIndex = todosLosEstados.findIndex(
    (e) => e.nombre === tramite.nombre_estado
  );

  const estadosAMostrar = todosLosEstados.slice(
    0,
    Math.max(estadoActualIndex + 2, 1)
  );

  // Cálculos para el código QR y enlace oficial
  const anio = new Date(tramite.fecha_solicitud).getFullYear();
  const codigoOficial = `UV-${anio}-${tramite.codigo_tramite}`;
  const urlVerificacion = `${baseUrl}/verificar/${codigoOficial}`;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header with Trámite Info */}
      <div className="bg-gradient-to-r from-[#8B1A1A]/5 to-[#6B1415]/5 px-6 py-4 border-b-2 border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-black">Tipo</p>
            <p className="text-lg text-gray-900">{tramite.tipo_tramite || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Fecha de Solicitud</p>
            <p className="text-lg text-gray-900">{formatDate(tramite.fecha_solicitud)}</p>
          </div>
        </div>
      </div>

      {/* Timeline Horizontal - Collapsible */}
      {expanded && (
      <div className="px-6 py-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Progreso del Trámite</h3>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-0 min-w-max">
            {estadosAMostrar.map((estado, index) => {
              const isCompleted = estadosCompletados.has(estado.nombre);
              const isCurrent = estado.nombre === tramite.nombre_estado;
              const isNext = index === estadosAMostrar.length - 1 && !isCurrent;

              return (
                <div key={estado.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`h-1 mb-2 ${isCompleted || isCurrent ? 'bg-[#8B1A1A]' : 'bg-gray-300'}`} style={{ width: '30px' }}></div>
                    <div
                      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-300 ${isCurrent
                        ? `${estado.color} ${estado.borderColor} ring-4 ring-[#8B1A1A]/20 shadow-lg scale-110`
                        : isCompleted
                          ? `${estado.color} ${estado.borderColor}`
                          : 'bg-gray-100 border-gray-300'
                        }`}
                    >
                      <span className="text-xl">{estado.icon}</span>
                    </div>

                    <div className="mt-3 text-center">
                      <p className={`text-xs font-semibold whitespace-nowrap ${isCompleted || isCurrent
                        ? `${estado.textColor}`
                        : 'text-gray-500'
                        }`}>
                        {estado.nombre.replace('Revision Tecnica', 'Revisión')}
                      </p>
                      {isCompleted && !isCurrent && (
                        <p className="text-xs text-gray-400 mt-1">✓ Completado</p>
                      )}
                      {isCurrent && (
                        <p className="text-xs font-bold text-[#8B1A1A] mt-1 animate-pulse">
                          En progreso
                        </p>
                      )}
                      {isNext && (
                        <p className="text-xs text-gray-400 mt-1">Próximo</p>
                      )}
                    </div>
                  </div>

                  {index < estadosAMostrar.length - 1 && (
                    <div className={`h-1 mx-0 flex-shrink-0 ${isCompleted ? 'bg-[#8B1A1A]' : 'bg-gray-300'}`} style={{ width: '16px' }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            SECCIÓN DEL CÓDIGO QR Y DOCUMENTO FINAL
        ========================================================= */}
        {tramite.nombre_estado === 'Finalizado' && (
          <div className="mt-8 mb-6 bg-green-50 rounded-xl border border-green-200 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="bg-white p-3 border border-green-200 rounded-xl shadow-sm flex-shrink-0">
              <QRCodeSVG value={urlVerificacion} size={110} level="H" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-bold mb-3 border border-green-300">
                <span className="material-symbols-outlined text-[16px]">verified</span> 
                Documento Emitido
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Tu certificado está listo</h4>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                Puedes verificar la autenticidad de tu constancia escaneando este QR o utilizando tu código único de seguridad en nuestra plataforma.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center md:items-start">
                <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 font-mono text-sm font-bold text-gray-800 shadow-sm flex items-center">
                  <span className="text-gray-400 mr-2 uppercase text-[10px] tracking-widest">Código:</span>
                  {codigoOficial}
                </div>
                <a
                  href={`/verificar/${codigoOficial}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#8B1A1A] hover:bg-[#6b1414] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  Ver Documento
                  <span className="text-lg">→</span>
                </a>
              </div>
            </div>
          </div>
        )}
        {/* ========================================================= */}

        {/* Historial detallado */}
        {tramite.historial && tramite.historial.length > 0 && (
          <div className="mt-4 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">📋 Historial Detallado</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
              {tramite.historial.map((estado, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="text-lg flex-shrink-0 pt-0.5">
                    {todosLosEstados.find((e) => e.nombre === estado.nombre_estado)?.icon || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">
                      {estado.nombre_estado}
                    </p>
                    <p className="text-xs text-black mt-0.5">
                      {formatDate(estado.fecha)}
                    </p>
                    {estado.comentario && (
                      <p className="text-xs text-gray-700 mt-1.5 italic bg-white px-2 py-1 rounded border-l-2 border-[#8B1A1A]">
                        {estado.comentario}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Footer with Current Status */}
      <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-3 h-3 rounded-full bg-[#8B1A1A] animate-pulse flex-shrink-0"></div>
          <span className="font-semibold text-gray-900">Estado Actual:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${todosLosEstados.find((e) => e.nombre === tramite.nombre_estado)?.color || 'bg-gray-50'
            } border-2 ${todosLosEstados.find((e) => e.nombre === tramite.nombre_estado)?.borderColor || 'border-gray-300'
            }`}>
            {tramite.nombre_estado}
          </span>
          {tramite.nombre_estado === 'Finalizado' && !tramite.visto_por_usuario && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-bold animate-pulse">
              🎉 ¡NUEVO!
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm px-3 py-2 bg-gray-200 text-gray-900 hover:bg-gray-300 font-semibold rounded-lg transition-colors duration-300"
          >
            {expanded ? '▼ Ocultar' : '▶ Ver Detalles'}
          </button>
          <button
            onClick={async () => {
              if (tramite.nombre_estado === 'Finalizado' && !tramite.visto_por_usuario) {
                try {
                  await fetch('/api/usuario/marcar-tramite-visto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_tramite: tramite.id_tramite }),
                  });
                } catch (err) {
                  console.error('Error marcando como visto:', err);
                }
              }
              window.location.href = `/usuario/consulta-tramite?codigo=${encodeURIComponent(tramite.codigo_tramite)}`;
            }}
            className="text-sm px-3 py-2 text-[#8B1A1A] hover:underline font-semibold transition-colors duration-300 hover:text-[#6B1415]"
          >
            Ir a trámite →
          </button>
        </div>
      </div>
    </div>
  );
}

function TramiteCard({ tramite, index }: TramiteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { agregarTramite } = useCarrito();
  const router = useRouter();

  const handleIniciarTramite = () => {
    agregarTramite({
      id: tramite.id,
      name: tramite.name,
      descripcion: tramite.descripcion,
      costo: tramite.costo,
      requisitos: tramite.requisitos,
    });
    router.push('/usuario/carrito');
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full"
    >
      <div
        className={`h-full bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col ${isHovered ? 'border-[#8B1A1A] scale-105' : ''
          }`}
      >
        <div className="text-5xl mb-4">{tramite.icono}</div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {tramite.name}
        </h3>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed h-14 line-clamp-3">
          {tramite.descripcion}
        </p>

        <div className="mt-auto">
          <button
            onClick={handleIniciarTramite}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 ${isHovered
              ? 'bg-[#8B1A1A] text-white shadow-lg'
              : 'bg-gray-100 text-[#8B1A1A] hover:bg-gray-200'
              }`}
          >
            Iniciar Trámite
          </button>
        </div>
      </div>
    </div>
  );
}