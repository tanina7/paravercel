'use client';

export default function PortalPublicoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#8B1A1A] mb-4">
          ¡Bienvenido!
        </h1>

        <p className="text-gray-600 mb-6">
          El sistema está funcionando correctamente en Vercel.
        </p>

        <div className="space-y-4">
          <a
            href="/auth/login"
            className="inline-block bg-[#8B1A1A] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#6b1414]"
          >
            Iniciar Sesión
          </a>

          <p className="text-sm text-gray-500">
            Portal de Trámites UV
          </p>
        </div>
      </div>
    </div>
  );
}