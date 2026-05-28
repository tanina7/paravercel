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
  const [search, setSearch] = useState('');

  // OBTENER DATOS
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

  // APROBAR / RECHAZAR
  const actualizarEstado = async (id: number, aprobar: boolean) => {

    const confirmar = confirm(
      `¿Seguro que deseas ${aprobar ? 'aprobar' : 'rechazar'} este trámite?`
    );

    if (!confirmar) return;

    try {
      setLoadingId(id);

      const res = await fetch('/api/cajero/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_tramite: id,
          aprobar,
          comentario: '',
          id_usuario: 1
        })
      });

      const json = await res.json();

      if (json.success) {
        // ✅ ELIMINA EL TRÁMITE DE LA TABLA
        setData(prev =>
          prev.filter(t => t.id_tramite !== id)
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

  // FILTRO
  const filteredData = data.filter((item) => {
    const term = search.toLowerCase();

    return (
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.correo?.toLowerCase().includes(term) ||
      item.nombre_estado?.toLowerCase().includes(term) ||
      String(item.id_tramite).includes(term)
    );
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Trámites
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los trámites pendientes
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full md:w-96">

          <input
            type="text"
            value={search}
            placeholder="Buscar por nombre, correo o ID..."
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-gray-300
              bg-gray-50
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-red-800
            "
          />

        </div>

      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">

        <table className="w-full">

          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Correo</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Comprobante</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">

            {filteredData.length > 0 ? (
              filteredData.map((tramite) => (

                <tr key={tramite.id_tramite} className="hover:bg-gray-50">

                  <td className="p-4 font-semibold">
                    #{tramite.id_tramite}
                  </td>

                  <td className="p-4">
                    {tramite.nombre_completo}
                  </td>

                  <td className="p-4 text-gray-600">
                    {tramite.correo}
                  </td>

                  <td className="p-4 font-semibold">
                    {tramite.nombre_estado}
                  </td>

                  <td className="p-4">

                    {tramite.comprobante_pago ? (
                      <a
                        href={tramite.comprobante_pago}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        Ver comprobante
                      </a>
                    ) : (
                      <span className="text-gray-500">
                        No disponible
                      </span>
                    )}

                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button
                        disabled={loadingId === tramite.id_tramite}
                        onClick={() => actualizarEstado(tramite.id_tramite, true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {loadingId === tramite.id_tramite ? '...' : 'Aprobar'}
                      </button>

                      <button
                        disabled={loadingId === tramite.id_tramite}
                        onClick={() => actualizarEstado(tramite.id_tramite, false)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {loadingId === tramite.id_tramite ? '...' : 'Rechazar'}
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}