'use client';

export default function TramitesPage() {
  // Estructura limpia y sin datos quemados
  const indicators = [
    { label: 'Nuevas Solicitudes', value: '0', icon: 'mail' },
    { label: 'En Proceso', value: '0', icon: 'sync' },
    { label: 'Completados', value: '0', icon: 'done_all' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-[#8B1A1A]">Resumen de Actividad</h2>
        <p className="text-gray-500 mt-1">Gestión de trámites académicos y administrativos.</p>
      </div>

      {/* Tarjetas de Indicadores (Solo Blanco y Guindo) */}
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

      {/* Contenedor Principal Vacío */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Trámites Pendientes de Revisión</h3>
          {/* Aquí luego irá el buscador */}
        </div>
        
        {/* Estado "Sin Datos" */}
        <div className="p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">
            inbox
          </span>
          <p className="text-gray-500 font-medium text-lg">No hay trámites activos en este momento.</p>
          <p className="text-sm text-gray-400 mt-2">Las nuevas solicitudes aparecerán en este panel.</p>
        </div>
      </div>
    </div>
  );
}