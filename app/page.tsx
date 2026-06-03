'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalPublicoPage() {
  const router = useRouter();
  const [codigoBusqueda, setCodigoBusqueda] = useState('');

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoBusqueda.trim()) {
      // Redirige a la página PÚBLICA de seguimiento
      router.push(`/seguimiento?codigo=${encodeURIComponent(codigoBusqueda.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#8B1A1A] selection:text-white bg-gray-50">
      
      {/* Header Minimalista */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 sm:px-8 flex items-center justify-between z-10 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8B1A1A] rounded flex items-center justify-center text-white font-bold text-xl">
            UV
          </div>
          <span className="font-bold text-gray-900 text-lg hidden sm:block">Universidad Privada del Valle</span>
        </div>
        
        {/* 🔥 Botón hacia tu ruta de login real 🔥 */}
        <button 
          onClick={() => router.push('/auth/login')}
          className="text-sm font-semibold text-gray-600 hover:text-[#8B1A1A] transition-colors flex items-center gap-2"
        >
          <span>👤</span> Iniciar Sesión
        </button>
      </header>

      {/* Hero Section (El Buscador Central) */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 py-12 overflow-hidden">
        
        {/* Fondo decorativo */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-red-100/50 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-gray-200/50 blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-[#8B1A1A] text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Portal de Verificación Pública
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Consulta el estado de tu <br className="hidden sm:block" />
            <span className="text-[#8B1A1A]">Trámite Universitario</span>
          </h1>
          
          <p className="text-gray-600 mb-10 max-w-lg text-lg">
            Ingresa tu código de seguridad (Ej: UV-2026-TRM-XXXX) para conocer el progreso o verificar la autenticidad de un documento oficial.
          </p>

          {/* Tarjeta del Buscador */}
          <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleBuscar} className="flex flex-col gap-4">
              <div className="text-left">
                <label htmlFor="codigoTramite" className="block text-sm font-bold text-gray-700 mb-2">
                  Código del Trámite
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                  <input
                    id="codigoTramite"
                    type="text"
                    value={codigoBusqueda}
                    onChange={(e) => setCodigoBusqueda(e.target.value)}
                    placeholder="UV-2026-TRM-..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#8B1A1A] focus:ring-4 focus:ring-red-50 transition-all outline-none font-mono text-gray-800 uppercase"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#8B1A1A] hover:bg-[#6b1414] text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-red-200 active:scale-95 flex items-center justify-center gap-2 text-lg mt-2"
              >
                Buscar Documento
                <span>→</span>
              </button>
            </form>
          </div>

          {/* Ayuda adicional */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>❓</span>
            <p>¿No encuentras tu código? Revisa el correo electrónico de confirmación.</p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-sm text-gray-400 z-10 relative">
        <p>© 2026 Universidad Privada del Valle. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}