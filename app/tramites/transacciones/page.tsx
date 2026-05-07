'use client';

import { useState } from 'react';
import Link from 'next/link';

// ==========================================
// DATOS FALSOS (Simulando trámites ya terminados)
// ==========================================
const transaccionesFinalizadas = [
  {
    id_tramite: 4,
    codigo_tramite: 'TRM-004',
    estudiante: 'Leandro Estudiante',
    carrera: 'Ingeniería de Sistemas',
    tipo_tramite: 'Legalización de Título',
    fecha_emision: '06/05/2026',
    codigo_certificado: 'CERT-2026-847291',
    codigo_seguridad: 'J55HSCF233'
  },
  {
    id_tramite: 1,
    codigo_tramite: 'TRM-001',
    estudiante: 'María González Pérez',
    carrera: 'Ingeniería de Sistemas',
    tipo_tramite: 'Cambio de Sub Sede',
    fecha_emision: '05/05/2026',
    codigo_certificado: 'CERT-2026-102938',
    codigo_seguridad: 'X99KLM442'
  },
  {
    id_tramite: 5,
    codigo_tramite: 'TRM-005',
    estudiante: 'Carlos Rodríguez Silva',
    carrera: 'Administración',
    tipo_tramite: 'Certificado de Notas',
    fecha_emision: '02/05/2026',
    codigo_certificado: 'CERT-2026-556123',
    codigo_seguridad: 'A12ZXY889'
  }
];

export default function TransaccionesPage() {
  // Estado para el buscador
  const [busqueda, setBusqueda] = useState('');

  // Lógica del buscador: Filtra por Código de Trámite, Certificado o Nombre
  const transaccionesFiltradas = transaccionesFinalizadas.filter((t) => 
    t.codigo_tramite.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.codigo_certificado.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.estudiante.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Encabezado y Buscador */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Transacciones y Emisiones</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Historial de todos los trámites que ya han sido finalizados y emitidos.
          </p>
        </div>
        
        {/* Buscador Funcional */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">
            search
          </span>
          <input 
            type="text" 
            placeholder="Buscar por TRM, CERT o nombre..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] transition-shadow shadow-sm"
          />
        </div>
      </div>

      {/* 2. Tabla de Transacciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-200">
                <th className="py-5 px-6">Código Trámite</th>
                <th className="py-5 px-6">Estudiante</th>
                <th className="py-5 px-6 text-center">Certificado Emitido</th>
                <th className="py-5 px-6 text-center">Fecha Emisión</th>
                <th className="py-5 px-6 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {transaccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                    <p className="text-gray-500 font-medium">No se encontraron transacciones con "{busqueda}"</p>
                  </td>
                </tr>
              ) : (
                transaccionesFiltradas.map((t) => (
                  <tr key={t.id_tramite} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* Código del Trámite */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gray-100 text-gray-700 font-mono text-sm font-bold border border-gray-200">
                        {t.codigo_tramite}
                      </span>
                    </td>

                    {/* Datos del Estudiante */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900 text-sm">{t.estudiante}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.carrera} - {t.tipo_tramite}</p>
                    </td>

                    {/* Datos del Certificado Generado */}
                    <td className="py-4 px-6 text-center">
                      <p className="font-mono text-[#8B1A1A] font-bold text-sm">{t.codigo_certificado}</p>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">lock</span>
                        {t.codigo_seguridad}
                      </p>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm text-gray-600 font-medium">{t.fecha_emision}</span>
                    </td>

                    {/* Botones de Acción */}
                    <td className="py-4 px-6 text-center">
                      <Link 
                        href={`/tramites/emision/${t.id_tramite}`}
                        className="inline-flex items-center justify-center gap-1 text-[#8B1A1A] hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold transition-colors border border-transparent hover:border-red-100"
                        title="Ver Certificado"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        Ver Documento
                      </Link>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
        
        {/* Footer de la tabla */}
        <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-between items-center text-xs text-gray-500">
          <span>Mostrando {transaccionesFiltradas.length} transacciones</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-green-600">verified</span>
            Todos los documentos son válidos
          </span>
        </div>
      </div>
    </div>
  );
}