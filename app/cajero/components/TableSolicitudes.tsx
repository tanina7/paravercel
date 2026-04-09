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

  useEffect(() => {
    fetch('/api/cajero/tramites')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          console.error('API inesperada:', json);
        }
      })
      .catch(err => console.error('Error API tramites:', err));
  }, []);

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow">

      {/* TITULO */}
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

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
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