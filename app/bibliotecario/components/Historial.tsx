'use client'

import { useEffect, useState } from 'react';

export default function Historial() {

  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // OBTENER DATOS
  const fetchData = async () => {
    try {

      const res = await fetch('/api/biblioteca/historial');
      const json = await res.json();

      setData(json);

    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FILTRO
  const filteredData = data.filter((item) => {

    const term = search.toLowerCase();

    return (
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.nombre_estado?.toLowerCase().includes(term) ||
      item.comentario?.toLowerCase().includes(term) ||
      String(item.id_tramite).includes(term)
    );
  });

  return (

    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Historial de Movimientos en Biblioteca
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Consulta todos los movimientos realizados 
          </p>

        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative w-full md:w-96">

          {/* ICONO */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

          </div>

          <input
            type="text"
            value={search}
            placeholder="Buscar por nombre, estado, comentario o ID..."
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              pl-10
              pr-10
              py-3
              rounded-xl
              border
              border-gray-300
              bg-gray-50
              text-sm
              text-gray-700
              placeholder-gray-400
              shadow-sm
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-red-800
              focus:border-red-800
              focus:bg-white
            "
          />

          {/* LIMPIAR */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="
                absolute
                inset-y-0
                right-0
                flex
                items-center
                pr-3
                text-gray-400
                hover:text-gray-600
                transition
              "
            >
              ✕
            </button>
          )}

        </div>

      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">

        <table className="w-full">

          {/* HEADER */}
          <thead className="bg-red-900 text-white">

            <tr>

              <th className="p-4 text-left">
                ID Trámite
              </th>

              <th className="p-4 text-left">
                Nombre
              </th>

              <th className="p-4 text-left">
                Estado
              </th>

              <th className="p-4 text-left">
                Comentario
              </th>

              <th className="p-4 text-left">
                Fecha
              </th>

            </tr>

          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100 bg-white text-gray-800">

            {filteredData.length > 0 ? (

              filteredData.map((item, index) => (

                <tr
                  key={`${item.id_tramite}-${index}`}
                  className="hover:bg-gray-50 transition-colors"
                >

                  <td className="p-4 font-semibold text-gray-800">
                    #{item.id_tramite}
                  </td>

                  <td className="p-4 text-gray-700">
                    {item.nombre_completo}
                  </td>

                  <td className="p-4">

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        ${
                          item.nombre_estado === 'Finalizado'
                            ? 'bg-green-100 text-green-800'
                            : item.nombre_estado === 'Rechazado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      `}
                    >
                      {item.nombre_estado}
                    </span>

                  </td>

                  <td className="p-4 text-gray-600 italic">
                    {item.comentario || 'Sin observaciones'}
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {new Date(item.fecha).toLocaleString('es-BO')}
                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500"
                >
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