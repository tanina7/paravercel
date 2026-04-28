'use client'
import React, { useEffect, useState } from 'react';

interface Tramite {
  id_tramite: number;
  nombre_completo: string;
  correo: string;
  nombre_estado: string;
  comprobante_pago?: string;
}

export default function TableSolicitudes() {
  const [data, setData] = useState<Tramite[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // 🔹 Obtener datos
  const fetchData = async () => {
    try {
      const res = await fetch('/api/cajero/tramites');
      const json = await res.json();

      if (Array.isArray(json)) {
        setData(json);
      } else {
        console.error('API inesperada:', json);
      }
    } catch (err) {
      console.error('Error API tramites:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Aprobar / Rechazar
  const actualizarEstado = async (id: number, aprobar: boolean) => {
    const confirmar = confirm(
      `¿Seguro que deseas ${aprobar ? 'aprobar' : 'rechazar'} este trámite?`
    );
    if (!confirmar) return;

    try {
      setLoadingId(id);

      const res = await fetch('/api/cajero/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_tramite: id,
          aprobar,
          comentario: '',
          id_usuario: 1 // 🔹 cámbialo luego por usuario real
        })
      });

      const json = await res.json();

      if (json.success) {
        // 🔹 actualizar UI sin recargar
        setData(prev =>
          prev.map(t =>
            t.id_tramite === id
              ? { ...t, nombre_estado: aprobar ? 'Pagado' : 'Rechazado' }
              : t
          )
        );
      } else {
        alert(json.error || 'Error al procesar');
      }

    } catch (err) {
      console.error(err);
      alert('Error del servidor');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-4">
        Trámites
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg overflow-hidden">

          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Comprobante</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((tramite, index) => (
                <tr
                  key={`${tramite.id_tramite}-${index}`}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-900">
                    #{tramite.id_tramite}
                  </td>

                  <td className="p-3 text-gray-800">
                    {tramite.nombre_completo}
                  </td>

                  <td className="p-3 text-gray-600">
                    {tramite.correo}
                  </td>

                  <td className="p-3 font-semibold text-gray-800">
                    {tramite.nombre_estado}
                  </td>

                  <td className="p-3">
                    {tramite.comprobante_pago ? (
                      <a
                        href={tramite.comprobante_pago}
                        target="_blank"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Ver comprobante
                      </a>
                    ) : (
                      <span className="text-gray-500">
                        No disponible
                      </span>
                    )}
                  </td>

                  <td className="p-3 space-x-2">

                    <button
                      disabled={loadingId === tramite.id_tramite}
                      onClick={() => actualizarEstado(tramite.id_tramite, true)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {loadingId === tramite.id_tramite ? '...' : 'Aprobar'}
                    </button>

                    <button
                      disabled={loadingId === tramite.id_tramite}
                      onClick={() => actualizarEstado(tramite.id_tramite, false)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {loadingId === tramite.id_tramite ? '...' : 'Rechazar'}
                    </button>

                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}