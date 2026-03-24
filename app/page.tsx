"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        // Redirección según el rol de la base de datos
        if (data.rol === "estudiante") router.push("/landing");
        else if (data.rol === "biblioteca") router.push("/bibliotecario");
        else if (data.rol === "operador") router.push("/tramites");
        else if (data.rol === "caja") router.push("/carrito");
        else router.push("/landing");
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fondo que ocupa toda la pantalla y centra el contenido
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 sm:p-6 md:p-8">
      
      {/* Tarjeta de Login: 
          w-full (ocupa todo el ancho en móvil) 
          max-w-md (se detiene en 448px en PC) */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border-t-[6px] border-[#800000] bg-white shadow-2xl">
        
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex flex-col items-center">
            {/* Logo responsivo */}
            <div className="relative mb-4 h-20 w-32 sm:h-24 sm:w-40">
              <Image 
                src="/logo.png" 
                alt="Univalle" 
                fill
                style={{ objectFit: 'contain' }}
                priority 
              />
            </div>
            <h2 className="text-xl font-bold text-[#800000] sm:text-2xl">Sistema de Trámites</h2>
            <p className="text-sm font-medium text-gray-500 sm:text-base">Panel de Acceso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Correo Institucional</label>
              <input
                type="email"
                required
                placeholder="ejemplo@univalle.edu"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-black transition-all focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 focus:outline-none"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-black transition-all focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 focus:outline-none"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-center border border-red-200">
                <p className="text-xs font-bold text-red-600 sm:text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl bg-[#800000] py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#600000] active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "VERIFICANDO..." : "INGRESAR AL SISTEMA"}
            </button>
          </form>

          <div className="mt-10 border-t border-gray-100 pt-6 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 sm:text-xs">
              © 2026 Universidad del Valle <br className="sm:hidden" /> Cochabamba - Bolivia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}