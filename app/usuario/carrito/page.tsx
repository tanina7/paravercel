'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/app/usuario/context/CarritoContext';
import Header from '../components/Header';

export default function CarritoPage() {
  const router = useRouter();
  const { items, eliminarTramite, obtenerTotal, vaciarCarrito } = useCarrito();

  const total = typeof obtenerTotal() === 'number' ? obtenerTotal() : 0;

  const handleConfirmar = () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Navegar a formulario
    router.push('/usuario/formulario');
  };

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
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 flex items-center justify-center gap-3">
              <svg
                className="w-10 h-10"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 3H3z" />
              </svg>
              Mi Carrito
            </h2>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              Revisa tus trámites seleccionados y confirma tu solicitud
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-grow py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            // Carrito vacío
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <div className="mb-6 flex justify-center">
                <svg
                  className="w-24 h-24 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 3H3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Carrito Vacío
              </h3>
              <p className="text-black mb-8">
                No has seleccionado ningún trámite todavía. ¡Comienza a agregar trámites a tu carrito!
              </p>
              <Link
                href="/usuario/SeleccionTramites"
                className="inline-block px-8 py-3 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Ver Trámites Disponibles
              </Link>
            </div>
          ) : (
            // Carrito con items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de trámites */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] px-6 py-4">
                    <h3 className="text-xl font-bold text-white">
                      Trámites Seleccionados ({items.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {items.map((tramite) => (
                      <div
                        key={tramite.id}
                        className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-grow pr-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {tramite.name}
                          </h4>
                          <p className="text-black text-sm mb-3">
                            {tramite.descripcion}
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                            <p className="text-xs font-semibold text-black mb-2">
                              Requisitos:
                            </p>
                            <p className="text-sm text-black">
                              {tramite.requisitos}
                            </p>
                          </div>
                          <p className="text-sm text-black">
                            ID: {tramite.id}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <div className="text-right">
                            <p className="text-xs text-black font-semibold mb-1">
                              COSTO
                            </p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] bg-clip-text text-transparent">
                              {tramite.costo} Bs
                            </p>
                          </div>

                          <button
                            onClick={() => eliminarTramite(tramite.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-md text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón volver */}
                <Link
                  href="/usuario/SeleccionTramites"
                  className="inline-block mt-6 px-6 py-2 border-2 border-[#8B1A1A] text-[#8B1A1A] rounded-lg font-semibold hover:bg-[#8B1A1A] hover:text-white transition-all duration-300"
                >
                  ← Continuar Seleccionando
                </Link>
              </div>

              {/* Resumen y pago */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-24">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] px-6 py-4">
                    <h4 className="text-xl font-bold text-white">Resumen</h4>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      {items.map((tramite) => (
                        <div
                          key={tramite.id}
                          className="flex justify-between text-sm text-black"
                        >
                          <span className="truncate pr-2">{tramite.name}</span>
                          <span className="font-semibold text-gray-900 flex-shrink-0">
                            {(typeof tramite.costo === 'string' ? parseFloat(tramite.costo) : Number(tramite.costo)).toFixed(2)} Bs
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-4 mt-4"></div>

                    {/* Cantidad */}
                    <div className="flex justify-between items-center">
                      <p className="text-black font-semibold">Cantidad:</p>
                      <p className="text-lg font-bold text-gray-900">
                        {items.length} {items.length === 1 ? 'trámite' : 'trámites'}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-black font-semibold mb-1">Total a Pagar:</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] bg-clip-text text-transparent">
                        {total.toFixed(2)} Bs
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <button
                      onClick={handleConfirmar}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition-all duration-300 hover:shadow-lg active:scale-95 text-center"
                    >
                      ✓ Continuar Tramite
                    </button>

                    <button
                      onClick={vaciarCarrito}
                      className="w-full px-6 py-2 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-semibold transition-all duration-300 text-center"
                    >
                      Vaciar Carrito
                    </button>
                  </div>

                  {/* Footer Info */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <p className="text-xs text-black text-center">
                      Confirma tu solicitud para proceder al pago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">¿Necesitas ayuda?</h3>
          <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
            Contáctanos si tienes dudas sobre tus trámites o el proceso de solicitud
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 rounded-lg font-semibold bg-white text-[#8B1A1A] hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95">
              Contactar Soporte
            </button>
            <Link
              href="/usuario/landing"
              className="px-8 py-3 rounded-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-all duration-300 text-center"
            >
              Volver a Inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
