'use client'
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../usuario/context/AuthContext';

export default function TableSolicitudes() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/biblioteca/solicitudes');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (observacion: string) => {
    try {
      await fetch('/api/biblioteca/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_tramite: selected.id_tramite,
          estado: action === 'aprobar' ? 'Revision Tecnica' : 'Rechazado', // <-- DB recibe Revision Tecnica
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

  const filteredData = data.filter((item) =>
    item.nombre_completo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow">

      {/* TITULO */}
      <h1 className="text-2xl font-bold mb-4">
        Solicitudes
      </h1>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        className="mb-4 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-900"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg overflow-hidden">

          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id_tramite} className="hover:bg-gray-50 transition">

                  <td className="p-3 font-medium text-gray-900">
                    #{item.id_tramite}
                  </td>

                  <td className="p-3 text-gray-800">
                    {item.nombre_completo}
                  </td>

                  <td className="p-3 text-gray-600">
                    {item.correo}
                  </td>

                  {/* Mostramos "Aprobado" si el estado real es "Revision Tecnica" */}
                  <td className="p-3 font-semibold text-gray-800">
                    {item.nombre_estado === 'Revision Tecnica'
                      ? 'Aprobado'
                      : item.nombre_estado}
                  </td>

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => { setSelected(item); setAction('aprobar'); }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      Aprobar
                    </button>

                    <button
                      onClick={() => { setSelected(item); setAction('rechazar'); }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      Rechazar
                    </button>
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

      {/* MODAL */}
      {selected && (
        <Modal
          title={action === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}