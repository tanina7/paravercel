'use client'
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';

export default function TableSolicitudes() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState('');
  const { user } = useAuth();

  // 🔥 DATOS DE PRUEBA
  const fetchData = async () => {
    const fakeData = [
      {
        id_tramite: 1,
        nombre_completo: 'Juan Pérez',
        correo: 'juan@gmail.com'
      },
      {
        id_tramite: 2,
        nombre_completo: 'María López',
        correo: 'maria@gmail.com'
      },
      {
        id_tramite: 3,
        nombre_completo: 'Carlos Ruiz',
        correo: 'carlos@gmail.com'
      }
    ];

    setData(fakeData);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (observacion: string) => {
    console.log('Simulando envío:', {
      id_tramite: selected.id_tramite,
      estado: action === 'aprobar' ? 'Finalizado' : 'Rechazado',
      comentario: observacion,
      id_usuario: user?.id_usuario || 1
    });

    // 🔥 Simulación sin backend
    setSelected(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Solicitudes (Modo Prueba 🚀)</h1>
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-red-900 text-white">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Correo</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id_tramite} className="border-t">
              <td className="p-2">{item.id_tramite}</td>
              <td className="p-2">{item.nombre_completo}</td>
              <td className="p-2">{item.correo}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => { setSelected(item); setAction('aprobar'); }}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => { setSelected(item); setAction('rechazar'); }}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Rechazar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <Modal
          title={action === 'aprobar' ? 'Aprobar' : 'Rechazar'}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}