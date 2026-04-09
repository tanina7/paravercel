'use client'
import { useEffect, useState } from 'react';
import Modal from './Modal';

export default function TableSolicitudes() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cajero/tramites');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const text = await res.text();
      const json = text ? JSON.parse(text) : [];
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      setData([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (observacion: string) => {
    if (!selected) return;

    const estado = action === 'aprobar' ? 'Pagado' : 'Rechazado';

    try {
      await fetch('/api/cajero/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_tramite: selected.id_tramite,
          estado,
          comentario: observacion
        })
      });
      setSelected(null);
      fetchData();
    } catch (error) {
      console.error('Error al procesar:', error);
    }
  };

  const filteredData = data.filter((item) =>
    (item.nombre_completo || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Trámites en Revisión Técnica</h1>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        className="mb-4 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-900"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg overflow-hidden">
          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Comprobante</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id_tramite} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-900">#{item.id_tramite}</td>
                  <td className="p-3 text-gray-800">{item.nombre_completo || 'Sin nombre'}</td>
                  <td className="p-3 text-gray-600">{item.correo || 'N/A'}</td>
                  <td className="p-3">
                    {item.comprobante ? (
                      <a href={item.comprobante} target="_blank" className="text-blue-600 underline">
                        Ver
                      </a>
                    ) : 'No disponible'}
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
                <td colSpan={5} className="text-center p-6 text-gray-500">No hay resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal
          title={action === 'aprobar' ? 'Aprobar Trámite' : 'Rechazar Trámite'}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}