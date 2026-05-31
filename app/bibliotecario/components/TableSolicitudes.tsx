'use client'

import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../usuario/context/AuthContext';

interface Solicitud {
  id_tramite: number;
  nombre_completo: string;
  correo: string;
  nombre_estado?: string;
  comprobante_pago?: string;
}

export default function TableSolicitudes() {

  const [data, setData] = useState<Solicitud[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');

  const { user } = useAuth();

  // OBTENER DATOS
  const fetchData = async () => {
    try {
      const res = await fetch('/api/biblioteca/solicitudes');
      const json = await res.json();

      if (Array.isArray(json)) {
        setData(json);
      } else {
        console.error('API inesperada:', json);
      }

    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // PROCESAR SOLICITUD
  const handleSubmit = async (observacion: string) => {
    try {

      await fetch('/api/biblioteca/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_tramite: selected.id_tramite,
          estado:
            action === 'aprobar'
              ? 'Revision Tecnica'
              : 'Rechazado',
          comentario: observacion,
          id_usuario: user?.id_usuario
        })
      });

      setSelected(null);
      fetchData();

    } catch (error) {
      console.error('Error al procesar:', error);
    }
  };

  // FILTRO
  const filteredData = data.filter((item) => {

    const term = search.toLowerCase();

    return (
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.correo?.toLowerCase().includes(term) ||
      String(item.id_tramite).includes(term)
    );
  });

  return (

    <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitudes
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestiona las solicitudes pendientes
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full md:w-96">

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
            placeholder="Buscar por nombre, correo o ID..."
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

          <thead className="bg-red-900 text-white">

            <tr>
              <th className="p-4 text-left">
                ID
              </th>

              <th className="p-4 text-left">
                Nombre
              </th>

              <th className="p-4 text-left">
                Correo
              </th>

              <th className="p-4 text-left">
                Comprobante
              </th>

              <th className="p-4 text-left">
                Acciones
              </th>
            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">

            {filteredData.length > 0 ? (

              filteredData.map((item) => (

                <tr
                  key={item.id_tramite}
                  className="hover:bg-gray-50 transition-colors"
                >

                  <td className="p-4 font-semibold text-gray-800">
                    #{item.id_tramite}
                  </td>

                  <td className="p-4 text-gray-700">
                    {item.nombre_completo}
                  </td>

                  <td className="p-4 text-gray-600">
                    {item.correo}
                  </td>

                  <td className="p-4">

                    {item.comprobante_pago ? (
                      <a
                        href={item.comprobante_pago}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
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
                        onClick={() => {
                          setSelected(item);
                          setAction('aprobar');
                        }}
                        className="
                          bg-green-600
                          hover:bg-green-700
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          font-medium
                          transition
                          shadow-sm
                        "
                      >
                        Aprobar
                      </button>

                      <button
                        onClick={() => {
                          setSelected(item);
                          setAction('rechazar');
                        }}
                        className="
                          bg-red-600
                          hover:bg-red-700
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          font-medium
                          transition
                          shadow-sm
                        "
                      >
                        Rechazar
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500"
                >
                  No se encontraron solicitudes
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {selected && (
        <Modal
          title={
            action === 'aprobar'
              ? 'Aprobar Solicitud'
              : 'Rechazar Solicitud'
          }
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}

    </div>
  );
}