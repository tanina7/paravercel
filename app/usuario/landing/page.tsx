'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import { useCarrito } from '@/app/usuario/context/CarritoContext';
import Header from '../components/Header';

// --- NUEVO: Función para cargar librerías de PDF ---
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

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

  // --- NUEVOS ESTADOS PARA EL MODAL DE VERIFICACIÓN ---
  const [showModalVerificacion, setShowModalVerificacion] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [errorVerificacion, setErrorVerificacion] = useState('');
  const [tramiteVerificado, setTramiteVerificado] = useState<any>(null);
  const [firmasDB, setFirmasDB] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

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
    setBaseUrl(window.location.origin);
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

  // --- NUEVA LÓGICA DE VERIFICACIÓN (SIN REDIRECCIÓN) ---
  const handleVerificarDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigoTrimmed = codigoVerificacion.trim();
    if (!codigoTrimmed) {
      alert('Por favor ingresa el código de verificación del documento');
      return;
    }

    setShowModalVerificacion(true);
    setVerificando(true);
    setErrorVerificacion('');
    setTramiteVerificado(null);

    try {
      const cargarTramite = fetch(`/api/verificar/${encodeURIComponent(codigoTrimmed)}`).then(res => res.json());
      const cargarFirmas = fetch('/api/obtener-firmas').then(res => res.json());

      const [dataTramite, dataFirmas] = await Promise.all([cargarTramite, cargarFirmas]);

      if (dataTramite.success) {
        const t = dataTramite.data;
        let archivosParseados = [];
        if (typeof t.archivos === 'string') {
          try { archivosParseados = JSON.parse(t.archivos); } catch(e) {}
        } else if (Array.isArray(t.archivos)) {
          archivosParseados = t.archivos;
        }

        setTramiteVerificado({
          id_tramite: t.id_tramite,
          codigo_tramite: codigoTrimmed,
          nombre_completo: t.nombre_completo,
          correo: t.correo,
          carrera: t.carrera,
          tipo_tramite: t.nombre_tramite || t.tipo_tramite,
          fecha_cierre: t.fecha_creacion,
          archivos: archivosParseados.filter((doc: any) => doc && doc.archivo),
          firma_digital_url: t.firma_ids || t.firma_digital_url,
          monto: t.monto || '---',
        });
      } else {
        setErrorVerificacion('Documento no encontrado o código inválido.');
      }

      if (dataFirmas.success) {
        setFirmasDB(dataFirmas.firmas);
      }
    } catch (error) {
      setErrorVerificacion('Error de conexión al verificar el documento.');
    } finally {
      setVerificando(false);
    }
  };

  const handleDescargarPDF = async () => {
    const elemento = document.getElementById('certificado-pantalla-modal');
    if (!elemento) return;
    setIsDownloading(true);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const domtoimage = (window as any).domtoimage;
      const jsPDF = (window as any).jspdf.jsPDF;

      const imgData = await domtoimage.toPng(elemento, { 
        bgcolor: '#ffffff',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); 
      pdf.save(`Verificacion_${tramiteVerificado.codigo_tramite}.pdf`);
    } catch (error) {
      alert("Hubo un error generando el PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const obtenerNombreRol = (id_rol?: number) => {
    switch (id_rol) {
      case 5: return "Director de Carrera";
      case 6: return "Vicerrector Académico";
      case 7: return "Rector";
      case 1: return "Estudiante";
      default: return "Autoridad";
    }
  };

  let firmasUsadas = [];
  if (tramiteVerificado && firmasDB.length > 0) {
    firmasUsadas = firmasDB.filter(f => {
      if (!tramiteVerificado.firma_digital_url) return false;
      const guardadoStr = String(tramiteVerificado.firma_digital_url);
      return guardadoStr.includes(String(f.id_usuario)) || guardadoStr.includes(f.firma_digital_url);
    });
    if (firmasUsadas.length === 0) firmasUsadas = [firmasDB[0]]; 
  }
  // --------------------------------------------------------

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
          APARTADO: VERIFICAR DOCUMENTO 
      ========================================================= */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-green-600 mb-4"></span>
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
                <span className="material-symbols-outlined"></span>
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

      {/* =========================================================
          MODAL DE VERIFICACIÓN GIGANTE (OVERLAY)
      ========================================================= */}
      {showModalVerificacion && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/80 backdrop-blur-sm overflow-y-auto pt-10 pb-20 custom-scrollbar animate-in fade-in">
          
          <button 
            onClick={() => {
              setShowModalVerificacion(false);
              setTramiteVerificado(null);
            }} 
            className="fixed top-6 right-8 text-white hover:text-red-400 transition-colors z-50 flex flex-col items-center gap-1"
          >
            <span className="material-symbols-outlined text-4xl block">cancel</span>
            <span className="text-xs font-bold tracking-widest uppercase">Cerrar</span>
          </button>

          <div className="w-full max-w-[230mm] px-4 animate-in zoom-in-95 duration-300">
            
            {verificando && (
              <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-6xl animate-spin text-green-600 mb-4">sync</span>
                <h3 className="text-2xl font-bold text-gray-800">Verificando Código...</h3>
                <p className="text-gray-500 mt-2">Consultando bases de datos de UNIVALLE</p>
              </div>
            )}

            {errorVerificacion && !verificando && (
              <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center shadow-2xl text-center border-t-4 border-red-500">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <h3 className="text-2xl font-bold text-gray-800">Verificación Fallida</h3>
                <p className="text-gray-600 mt-2">{errorVerificacion}</p>
                <button 
                  onClick={() => setShowModalVerificacion(false)}
                  className="mt-6 bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}

            {tramiteVerificado && !verificando && (
              <div className="flex flex-col items-center">
                {/* Indicador de Éxito */}
                <div className="bg-white px-8 py-4 rounded-full shadow-lg flex items-center gap-3 mb-6 border-2 border-green-500">
                  <span className="material-symbols-outlined text-3xl text-green-500">verified</span>
                  <span className="text-xl font-black text-gray-800 uppercase tracking-wide">Documento Auténtico</span>
                </div>

                {/* EL CERTIFICADO A4 */}
                <div id="certificado-pantalla-modal" className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col border border-gray-200">
                  <div className="bg-[#8B1A1A] text-white pt-8 pb-6 px-10">
                    <h1 className="text-2xl font-bold tracking-wide mb-1">UNIVERSIDAD PRIVADA DEL VALLE — UNIVALLE</h1>
                    <p className="text-sm opacity-90 mb-3">Sistema de Gestión de Trámites Académicos</p>
                    <h2 className="text-xl font-black tracking-wide">CONSTANCIA DE TRÁMITE — DOCUMENTO FINAL</h2>
                  </div>

                  <div className="flex flex-col flex-1 px-10 py-8">
                    <div className="flex justify-between text-sm text-gray-800 mb-8 font-medium">
                      <span>N° solicitud: #{tramiteVerificado.id_tramite}</span>
                      <span>Fecha de emisión: {new Date(tramiteVerificado.fecha_cierre || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    <div className="text-sm text-gray-800 mb-8 space-y-1.5">
                      <p className="font-bold text-base mb-2">Estudiante</p>
                      <p><span className="font-medium">Nombre:</span> {tramiteVerificado.nombre_completo}</p>
                      <p><span className="font-medium">Correo institucional:</span> {tramiteVerificado.correo || 'No registrado'}</p>
                      <p><span className="font-medium">Carrera:</span> {tramiteVerificado.carrera || 'No especificada'}</p>
                      <p><span className="font-medium">Registrado por Unidad de Trámites:</span> UNIVALLE</p>
                    </div>

                    <div className="mb-8">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-[#8B1A1A] text-white">
                            <th className="py-2.5 px-4 font-bold w-12 border border-[#8B1A1A]">#</th>
                            <th className="py-2.5 px-4 font-bold border border-[#8B1A1A]">Trámite / procedimiento</th>
                            <th className="py-2.5 px-4 font-bold text-right border border-[#8B1A1A]">Referencia costo</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <td className="py-3 px-4 border-x border-gray-200 text-gray-600">1</td>
                            <td className="py-3 px-4 border-x border-gray-200 font-medium text-gray-800">{tramiteVerificado.tipo_tramite}</td>
                            <td className="py-3 px-4 border-x border-gray-200 text-right text-gray-600">
                              Bs. {tramiteVerificado.monto !== undefined && tramiteVerificado.monto !== null ? tramiteVerificado.monto : '---'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mb-12">
                      <p className="text-sm font-bold text-gray-900 mb-1">Observaciones:</p>
                      <p className="text-xs text-gray-700 mb-4">Constancia final con registro de firmas de responsables institucionales (control documental).</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed text-justify pr-10">
                        Este documento consolida el registro de firmas correspondientes al flujo académico-administrativo ({String(tramiteVerificado.tipo_tramite || '').toLowerCase()}). Las imágenes adjuntas corresponden a las rúbricas institucionales cargadas por Trámites.
                      </p>
                    </div>

                    {firmasUsadas.length > 0 && (
                      <div className="flex justify-center items-end gap-16 mt-auto mb-16 pt-8">
                        {firmasUsadas.map((firma) => (
                          <div key={firma.id_usuario} className="flex flex-col items-center">
                            <img src={firma.firma_digital_url} alt="Firma" className="h-20 object-contain mix-blend-multiply" crossOrigin="anonymous" 
                              onError={(e) => { e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; }}
                            />
                            <div className="border-t border-gray-400 w-48 mt-2 text-center text-[11px] text-gray-800 pt-1 font-bold uppercase leading-tight">
                              {firma.nombre_completo}
                              <span className="block font-normal text-gray-500 mt-0.5">{obtenerNombreRol(firma.id_rol)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-start gap-4">
                      <div className="flex flex-col">
                        <div className="w-24 h-24 bg-white border border-gray-300 p-1 flex items-center justify-center">
                          <QRCodeSVG value={`${baseUrl}/verificar/${tramiteVerificado.codigo_tramite}`} size={86} level={"H"} />
                        </div>
                        <span className="text-[9px] font-bold mt-1 text-gray-800">Cód.: {tramiteVerificado.codigo_tramite}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-[10px] text-gray-500 max-w-[250px] leading-relaxed">Puede comprobar la autenticidad de esta constancia escaneando el código QR impreso.</p>
                      </div>
                    </div>
                  </div>
                </div>
{/* =======================================================
                   {/* =======================================================
                    SECCIÓN DE ADJUNTOS CORREGIDA (ÍCONOS BLINDADOS)
                ======================================================= */}
              {/* =======================================================
                    SECCIÓN DE ADJUNTOS CON EMOJIS (100% A PRUEBA DE FALLOS)
                ======================================================= */}
                {tramiteVerificado.archivos && tramiteVerificado.archivos.filter((d:any) => !String(d.tipo_archivo || d.tipo_documento).includes('Certificado PDF Oficial')).length > 0 && (
                  <div className="w-full max-w-[210mm] mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left">
                    <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                      <span className="text-2xl flex-shrink-0">📁</span> 
                      <span>Expediente Digital Adjunto</span>
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">Documentación adicional vinculada a este trámite oficial.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tramiteVerificado.archivos
                        .filter((d:any) => !String(d.tipo_archivo || d.tipo_documento).includes('Certificado PDF Oficial'))
                        .map((doc: any, i: number) => {
                          const linkArchivo = doc.archivo || doc.ruta_archivo || '#';
                          const nombreArchivo = doc.tipo_archivo || doc.tipo_documento || `Documento Adjunto ${i + 1}`;
                          const isPdf = String(linkArchivo).toLowerCase().endsWith('.pdf');
                          
                          return (
                            <a 
                              key={i} href={linkArchivo} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl transition-all duration-300 group"
                            >
                              {/* Caja del ícono con Emojis Nativos. ¡Jamás mostrará letras cortadas! */}
                              <div className="w-12 h-12 min-w-[48px] bg-white rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-red-300 shadow-sm overflow-hidden">
                                <span className="text-2xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                                  {isPdf ? '📄' : '⭐'}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="font-bold text-[13px] text-gray-800 group-hover:text-[#8B1A1A] truncate leading-tight mb-1" title={nombreArchivo}>
                                  {nombreArchivo}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate flex items-center gap-1.5 group-hover:text-red-500">
                                  <span className="text-[12px]">🔍</span>
                                  Ver documento
                                </p>
                              </div>
                            </a>
                          )
                        })}
                    </div>
                  </div>
                )}
                {/* Botón Descargar desde Modal */}
                <button 
                  onClick={handleDescargarPDF} 
                  disabled={isDownloading} 
                  className={`mt-6 w-full max-w-[210mm] bg-[#8B1A1A] hover:bg-[#6c1414] text-white font-black py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-wider ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`material-symbols-outlined text-2xl ${isDownloading ? 'animate-bounce' : 'download'}`}></span>
                  {isDownloading ? 'Generando PDF Seguro...' : 'Descargar Copia Oficial en PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
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

  const anio = new Date(tramite.fecha_solicitud).getFullYear();
  const codigoOficial = `UV-${anio}-${tramite.codigo_tramite}`;
  const urlVerificacion = `${baseUrl}/verificar/${codigoOficial}`;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
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

        {tramite.historial && tramite.historial.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">📋 Historial Detallado</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
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