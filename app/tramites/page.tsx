'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Definimos la estructura de lo que esperamos recibir de la base de datos
interface Tramite {
  id_tramite: number;
  codigo_tramite: string;
  tipo_tramite: string;
  nombre_estado: string;
  nombre_completo: string;
  fecha_creacion: string;
}

export default function TramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);

  // Consultar la API cuando la página cargue
  useEffect(() => {
    const fetchTramites = async () => {
      try {
        const res = await fetch('/api/tramites/pendientes');
        if (res.ok) {
          const data = await res.json();
          setTramites(data);
        } else {
          const errorData = await res.json();
          console.error("Error del servidor:", res.status, errorData);
        }
      } catch (error) {
        console.error("Error de red:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTramites();
  }, []);

  // Calculamos los indicadores de forma dinámica basándonos en los datos reales
  const nuevasSolicitudes = tramites.filter(t => t.nombre_estado === 'Pagado' || t.nombre_estado === 'Aprobado Biblioteca').length;
  const enProceso = tramites.filter(t => t.nombre_estado === 'En Proceso' || t.nombre_estado === 'Derivado a Tramites').length;

  const indicators = [
    { label: 'Nuevas Solicitudes', value: nuevasSolicitudes.toString(), icon: 'mail' },
    { label: 'En Proceso', value: enProceso.toString(), icon: 'sync' },
    { label: 'Completados', value: '0', icon: 'done_all' }, // Este se puede conectar a la ruta de historial después
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-[#8B1A1A]">Resumen de Actividad</h2>
        <p className="text-gray-500 mt-1">Gestión de trámites académicos y administrativos.</p>
      </div>

      {/* Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indicators.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#8B1A1A] flex justify-between items-center transition-transform hover:-translate-y-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-3xl font-black text-[#8B1A1A] mt-1">{item.value}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-gray-200">
              {item.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Trámites Pendientes de Revisión</h3>
        </div>
        
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">autorenew</span>
            <p>Cargando trámites...</p>
          </div>
        ) : tramites.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">inbox</span>
            <p className="text-gray-500 font-medium text-lg">No hay trámites activos en este momento.</p>
            <p className="text-sm text-gray-400 mt-2">Las nuevas solicitudes aparecerán en este panel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Código</th>
                  <th className="p-4 font-semibold">Estudiante</th>
                  <th className="p-4 font-semibold">Trámite</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tramites.map((tramite) => (
                  <tr key={tramite.id_tramite} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">{tramite.codigo_tramite}</td>
                    <td className="p-4 text-sm text-gray-600">{tramite.nombre_completo}</td>
                    <td className="p-4 text-sm text-gray-600">{tramite.tipo_tramite}</td>
                    <td className="p-4 text-sm">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                        {tramite.nombre_estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        href={`/tramites/revisar/${tramite.id_tramite}`}
                        className="inline-flex items-center gap-1 bg-[#8B1A1A] hover:bg-[#6b1414] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Revisar
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}