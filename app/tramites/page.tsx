'use client';

import Link from 'next/link';

// ==========================================
// 1. DATOS FALSOS (VISUAL PROVISIONAL)
// ==========================================
const tramitesProvisionales = [
  {
    id_tramite: 1,
    codigo_tramite: 'TRM-001',
    nombre_completo: 'María González Pérez',
    ci: '8765432',
    carrera: 'Ingeniería de Sistemas',
    anio: '4to Año',
    tipo_tramite: 'Cambio de Sub Sede',
    nombre_estado: 'Pagado',
    documentos_adjuntos: 3
  },
  {
    id_tramite: 2,
    codigo_tramite: 'TRM-002',
    nombre_completo: 'Carlos Rodríguez Silva',
    ci: '9876543',
    carrera: 'Administración',
    anio: '3er Año',
    tipo_tramite: 'Solicitud de Beca',
    nombre_estado: 'En Proceso',
    documentos_adjuntos: 5
  },
  {
    id_tramite: 3,
    codigo_tramite: 'TRM-003',
    nombre_completo: 'Ana Fernández López',
    ci: '5432167',
    carrera: 'Derecho',
    anio: '2do Año',
    tipo_tramite: 'Certificado de Estudios',
    nombre_estado: 'Derivado a Tramites',
    documentos_adjuntos: 2
  },
  {
    id_tramite: 4,
    codigo_tramite: 'TRM-004',
    nombre_completo: 'Leandro Estudiante',
    ci: '1234567',
    carrera: 'Ingeniería de Sistemas',
    anio: '5to Año',
    tipo_tramite: 'Legalización de Título',
    nombre_estado: 'Aprobado Biblioteca',
    documentos_adjuntos: 1
  }
];

export default function TramitesPage() {
  
  // Contadores automáticos basados en los datos falsos
  const nuevasSolicitudes = tramitesProvisionales.filter(t => t.nombre_estado === 'Pagado' || t.nombre_estado === 'Aprobado Biblioteca').length;
  const enProceso = tramitesProvisionales.filter(t => t.nombre_estado === 'En Proceso' || t.nombre_estado === 'Derivado a Tramites').length;

  const indicators = [
    { label: 'Nuevas Solicitudes', value: nuevasSolicitudes.toString(), icon: 'mail' },
    { label: 'En Proceso', value: enProceso.toString(), icon: 'sync' },
    { label: 'Completados', value: '0', icon: 'done_all' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* 2. Título de la tabla */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Trámites Solicitados</h2>
          <p className="text-gray-500 mt-1 text-sm">Lista de estudiantes pendientes de revisión</p>
        </div>
        
        {/* Buscador visual (No funcional todavía) */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">
            search
          </span>
          <input 
            type="text" 
            placeholder="Buscar estudiante..." 
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] w-64"
          />
        </div>
      </div>

      {/* 3. Contenedor de la Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-200">
                <th className="py-4 px-6">Estudiante</th>
                <th className="py-4 px-6 text-center">Carrera y Año</th>
                <th className="py-4 px-6 text-center">Tipo de Trámite</th>
                <th className="py-4 px-6 text-center">Documentos</th>
                <th className="py-4 px-6 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {/* Dibujamos directamente la lista de trámites falsos */}
              {tramitesProvisionales.map((tramite) => (
                <tr key={tramite.id_tramite} className="hover:bg-gray-50 transition-colors group">
                  
                  {/* Columna: Estudiante */}
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900 text-sm">{tramite.nombre_completo}</p>
                    <p className="text-gray-400 text-xs mt-0.5">C.I. {tramite.ci}</p>
                  </td>

                  {/* Columna: Carrera y Año */}
                  <td className="py-4 px-6 text-center">
                    <p className="text-gray-700 text-sm">{tramite.carrera}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{tramite.anio}</p>
                  </td>

                  {/* Columna: Tipo de Trámite */}
                  <td className="py-4 px-6 text-center">
                    <p className="text-gray-700 text-sm font-medium">{tramite.tipo_tramite}</p>
                  </td>

                  {/* Columna: Documentos (Badges azules) */}
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                      <span className="material-symbols-outlined text-[14px]">attach_file</span>
                      {tramite.documentos_adjuntos} Adjuntos
                    </span>
                  </td>

                  {/* Columna: Acción (Botón Ver Trámite) */}
                  <td className="py-4 px-6 text-center">
                    <Link 
                      href={`/tramites/revisar/${tramite.id_tramite}`}
                      className="inline-flex items-center justify-center bg-[#8B1A1A] hover:bg-[#6b1414] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Ver Trámite
                    </Link>
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}