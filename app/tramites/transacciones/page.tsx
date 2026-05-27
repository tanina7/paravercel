'use client';

import { useState, useEffect } from 'react';

// ==========================================
// INTERFAZ DE DATOS REALES
// ==========================================
interface TransaccionData {
  id_solicitud: number;
  nro_recibo: string;
  estudiante: string;
  concepto: string;
  monto: string | number;
  cajero: string;
}

export default function TransaccionesPage() {
  // --- ESTADOS ---
  const [transacciones, setTransacciones] = useState<TransaccionData[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // --- EFECTO PARA CARGAR DATOS ---
  useEffect(() => {
    fetch('/api/transacciones')
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTransacciones(data);
        } else {
          console.error("Error cargando transacciones. Formato incorrecto:", data);
        }
      })
      .catch((err) => console.error("Error de red:", err))
      .finally(() => setLoading(false));
  }, []);

  // --- LÓGICA DEL BUSCADOR PROTEGIDA ---
  const transaccionesFiltradas = transacciones.filter((t) => {
    const recibo = t.nro_recibo || '';
    const estudiante = t.estudiante || '';
    const concepto = t.concepto || '';
    const query = busqueda.toLowerCase();

    return (
      recibo.toLowerCase().includes(query) ||
      estudiante.toLowerCase().includes(query) ||
      concepto.toLowerCase().includes(query)
    );
  });

  // --- RENDERIZADO CONDICIONAL (Cargando) ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
        <p className="text-black font-bold">Cargando transacciones financieras...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 p-6">
      
      {/* 1. Encabezado y Botón de Exportar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-black mb-1">Transacciones Financieras (Caja)</h2>
          <p className="text-black font-medium text-sm">
            Consulta en tiempo real de pagos validados asociados a trámites.
          </p>
        </div>
        
        {/* Botón Exportar */}
        <button className="bg-[#334155] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exportar a Excel
        </button>
      </div>

      {/* Buscador */}
      <div className="relative w-full md:w-96 mb-6">
        <span className="material-symbols-outlined absolute left-3 top-3 text-black">
          search
        </span>
        <input 
          type="text" 
          placeholder="Buscar por Nro Recibo, estudiante o concepto..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-xl text-sm focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] transition-shadow shadow-sm text-black font-semibold placeholder-gray-600"
        />
      </div>

      {/* 2. Tabla de Transacciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-black text-[10px] font-black uppercase tracking-wider border-b border-gray-200">
                <th className="py-4 px-6 text-center">NRO. RECIBO</th>
                <th className="py-4 px-6">ESTUDIANTE</th>
                <th className="py-4 px-6">CONCEPTO PRINCIPAL</th>
                <th className="py-4 px-6 text-center">MONTO TOTAL</th>
                <th className="py-4 px-6 text-center">CAJERO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              
              {transaccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-500 mb-3">search_off</span>
                    <p className="text-black font-bold">No se encontraron transacciones</p>
                  </td>
                </tr>
              ) : (
                transaccionesFiltradas.map((t, index) => (
                  <tr key={`${t.id_solicitud}-${t.nro_recibo}-${index}`} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Nro Recibo */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-[#8B1A1A] font-bold text-sm">
                        {t.nro_recibo}
                      </span>
                    </td>

                    {/* Estudiante */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-black text-sm">{t.estudiante}</p>
                    </td>

                    {/* Concepto */}
                    <td className="py-4 px-6">
                      <p className="text-black font-medium text-sm">{t.concepto}</p>
                    </td>

                    {/* Monto */}
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-black text-sm">
                        {Number(t.monto).toFixed(2)} Bs.
                      </span>
                    </td>

                    {/* Cajero */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-black font-semibold text-sm">{t.cajero}</span>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}