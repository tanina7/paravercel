'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCarrito } from '@/app/usuario/context/CarritoContext';

interface TramiteQuickAccess {
  id: number;
  name: string;
  descripcion: string;
  icono: string;
  costo: number;
  requisitos: string;
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

const estadoConfig: Record<string, { label: string; color: string }> = {
  'Recibido': { label: 'Recibido', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  'Verificando Solvencia': { label: 'Verificando', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'Revision Tecnica': { label: 'En revisión', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  'Pago Pendiente': { label: 'Pago pendiente', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  'Pagado': { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-300' },
  'Listo para Impresion': { label: 'Listo', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  'Finalizado': { label: 'Finalizado', color: 'bg-green-200 text-green-900 border-green-400' },
  'Rechazado': { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-300' },
};

export default function LandingPage() {
  const router = useRouter();
  const [codigoTramite, setCodigoTramite] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Consulta
  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigoTramite.trim()) {
      alert('Por favor ingresa un código de trámite');
      return;
    }

    // Redireccionar a la página de consulta con el código como parámetro
    router.push(`/usuario/consulta-tramite?codigo=${encodeURIComponent(codigoTramite)}`);
    setCodigoTramite('');
  };

  // Carruseel navigation
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
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B1A1A] to-[#6B1415] flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-[#8B1A1A]">Trámites Univalle</h1>
          </div>

          
        </nav>
      </header>

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

      {/* Search Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Consulta el Estado de tu Trámite
            </h2>
            <p className="text-gray-600 text-lg">
              Ingresa el código de tu trámite para ver su estado en tiempo real
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleConsultar} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="text"
                placeholder="Ej: TRV-2025-001234"
                value={codigoTramite}
                onChange={(e) => setCodigoTramite(e.target.value)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 focus:border-[#8B1A1A] focus:outline-none transition-colors duration-300 placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-lg font-semibold bg-[#8B1A1A] text-white hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                Consultar Estado
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
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  Para poder realizar cualquier trámite universitario a través de esta plataforma,{' '}
                  <span className="font-bold text-[#8B1A1A]">
                    debes no tener deudas pendientes
                  </span>{' '}
                  con la Universidad del Valle.
                </p>
                <p className="text-gray-600">
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
              © 2025 Universidad del Valle. Todos los derechos reservados.
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
