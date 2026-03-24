'use client'
import { useEffect, useState } from 'react';

export default function Historial() {
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await fetch('/api/biblioteca/historial');
    const json = await res.json();
    setData(json);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Historial</h1>
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-red-900 text-white">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Comentario</th>
            <th className="p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id_tramite} className="border-t">
              <td className="p-2">{item.id_tramite}</td>
              <td className="p-2">{item.nombre_completo}</td>
              <td className="p-2">{item.nombre_estado}</td>
              <td className="p-2">{item.comentario}</td>
              <td className="p-2">{item.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}