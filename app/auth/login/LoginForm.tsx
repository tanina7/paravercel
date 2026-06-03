'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      const from = searchParams.get('from');

      // ✅ prioridad: backend manda redirectTo
      const redirectTo =
        typeof data.redirectTo === 'string' && data.redirectTo
          ? data.redirectTo
          : '/';

      const safeTarget =
        from && from.startsWith('/')
          ? from
          : redirectTo;

      router.push(safeTarget);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tarjeta principal con efecto Glassmorphism y sombras suaves */}
      <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Alerta de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
              <span className="text-lg">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Input: Correo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400">✉️</span>
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:bg-white focus:ring-0 focus:border-[#8B1A1A] transition-all outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="usuario@univalle.edu"
              />
            </div>
          </div>

          {/* Input: Contraseña */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400">🔒</span>
              </div>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:bg-white focus:ring-0 focus:border-[#8B1A1A] transition-all outline-none"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white font-bold rounded-xl shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando...</span>
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium">
            ¿Eres estudiante nuevo?{' '}
            <Link
              href="/auth/register"
              className="text-[#8B1A1A] font-bold hover:underline ml-1 transition-colors"
            >
              Crea tu cuenta aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}