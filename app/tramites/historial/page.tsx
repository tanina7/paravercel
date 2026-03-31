'use client';

export default function HistorialPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Encabezado de la página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Trámites</h1>
        <p className="text-gray-500 mt-2">
          Registro de procedimientos archivados y finalizados exitosamente.
        </p>
      </div>

      {/* Contenedor principal de la tabla */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Cabeceras de las columnas */}
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-48">
                  Cód. Trámite
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Estudiante
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Tipo
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Fecha Conclusión
                </th>
                <th className="py-5 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  Estado
                </th>
              </tr>
            </thead>

            {/* Cuerpo de la tabla (Estado Vacío) */}
            <tbody className="bg-white">
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                      <span className="material-symbols-outlined text-4xl text-gray-300">
                        history_toggle_off
                      </span>
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">
                      No hay registros en el historial
                    </p>
                    <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                      Los trámites que sean finalizados o archivados aparecerán automáticamente en esta lista.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
            
          </table>
        </div>
        
        {/* Paginación (Deshabilitada por ahora, solo diseño) */}
        <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Mostrando 0 de 0 registros</span>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              Anterior
            </button>
            <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              Siguiente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}