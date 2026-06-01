'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerificarTramitePage() {
  const params = useParams();
  const codigo = params?.codigo as string;
  const [tramite, setTramite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!codigo) return;

    const verificar = async () => {
      try {
        const res = await fetch(`/api/tramites/verificar/${codigo}`);
        const data = await res.json();
        if (data.success) {
          setTramite(data.tramite);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    verificar();
  }, [codigo]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">CARGANDO VALIDACIÓN...</div>;

  if (error || !tramite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-red-600 text-center max-w-sm">
          <h2 className="text-xl font-black text-red-600">DOCUMENTO NO VÁLIDO</h2>
          <p className="mt-2 text-gray-600">El código {codigo} no existe o ha sido alterado.</p>
          <Link href="/" className="mt-6 block bg-gray-900 text-white py-2 rounded">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-xl p-8 border-t-8 border-green-600">
        <h1 className="text-center text-green-600 font-black text-2xl uppercase mb-6">Trámite Auténtico</h1>
        <div className="space-y-4">
          <p><strong>Titular:</strong> {tramite.nombre_completo}</p>
          <p><strong>CI:</strong> {tramite.ci}</p>
          <p><strong>Trámite:</strong> {tramite.tipo_tramite}</p>
          <p><strong>Sede:</strong> {tramite.sede}</p>
          <p><strong>Fecha:</strong> {tramite.fecha_emision}</p>
        </div>
        <div className="mt-8 text-center text-xs text-gray-400">
          Validado por Sistema Tramites Univalle
        </div>
      </div>
    </div>
  );
}