'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCarrito } from '@/app/usuario/context/CarritoContext';
import Header from '../components/Header';

interface Tramite {
  id: number;
  name: string;
  descripcion: string;
  costo: number;
  requisitos: string;
}

export default function SeleccionTramites() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const { items, agregarTramite } = useCarrito();

  useEffect(() => {
    const fetchTramites = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tramites');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los trámites');
        }
        const data = await response.json();
        setTramites(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los trámites');
        setTramites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTramites();
  }, []);

  const tramitesFiltrados = tramites.filter(
    (tramite) =>
      tramite.name.toLowerCase().includes(filtro.toLowerCase()) ||
      tramite.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

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
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
              Nuestros Trámites Disponibles
            </h2>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              Consulta la lista completa de trámites universitarios con sus costos y requisitos
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-grow py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="🔍 Buscar trámites..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 focus:border-[#8B1A1A] focus:outline-none transition-colors duration-300 placeholder-gray-400 text-gray-900"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A] mb-4"></div>
                <p className="text-black font-semibold">Cargando trámites...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-semibold mb-3">⚠️ Error</p>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && tramitesFiltrados.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-black text-xl font-semibold mb-2">
                {filtro
                  ? `No se encontraron trámites con "${filtro}"`
                  : 'No hay trámites disponibles'}
              </p>
              {filtro && (
                <button
                  onClick={() => setFiltro('')}
                  className="px-6 py-2 bg-[#8B1A1A] hover:bg-[#6B1415] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 mt-4"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}

          {/* Tramites Grid */}
          {!loading && !error && tramitesFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tramitesFiltrados.map((tramite) => (
                <div
                  key={tramite.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#8B1A1A] group"
                >
                  {/* Card Header */}
                  <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415]"></div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#8B1A1A] transition-colors duration-300 line-clamp-2">
                      {tramite.name}
                    </h3>

                    {/* Description */}
                    <p className="text-black text-sm mb-4 line-clamp-2">
                      {tramite.descripcion}
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Requisites */}
                    <div className="mb-6 flex-grow">
                      <p className="text-xs font-semibold text-black mb-2 uppercase tracking-wide">
                        Requisitos:
                      </p>
                      <p className="text-sm text-black line-clamp-4 leading-relaxed">
                        {tramite.requisitos}
                      </p>
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">COSTO</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] bg-clip-text text-transparent">
                          {tramite.costo} Bs
                        </p>
                      </div>

                      <button
                        onClick={() => agregarTramite(tramite)}
                        className="px-4 py-2 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 text-sm"
                      >
                        Solicitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Counter */}
          {!loading && !error && tramites.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-600 font-semibold">
                Mostrando {tramitesFiltrados.length} de {tramites.length} trámites
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Botón Flotante de Carrito */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Link href="/usuario/carrito" className="flex items-center gap-3 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 active:scale-95 font-semibold">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 3H3z" />
            </svg>
            <span>Carrito ({items.length})</span>
          </Link>
        </div>
      )}

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">¿Necesitas ayuda?</h3>
          <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
            Contáctanos si tienes dudas sobre cualquiera de nuestros trámites o requisitos
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
  
