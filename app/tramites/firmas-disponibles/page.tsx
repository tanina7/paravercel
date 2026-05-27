'use client';

import { useState, useEffect } from 'react';

// Definimos cómo es una firma según la base de datos
interface FirmaData {
  id_usuario: number;
  nombre_completo: string;
  foto_perfil_url: string;
  firma_digital_url: string;
}

export default function FirmasDisponiblesPage() {
  const [firmas, setFirmas] = useState<FirmaData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- NUEVOS ESTADOS ---
  const [busqueda, setBusqueda] = useState('');
  const [firmaEnZoom, setFirmaEnZoom] = useState<FirmaData | null>(null);

  // Cuando la página carga, pedimos las firmas a la base de datos
  useEffect(() => {
    fetch('/api/obtener-firmas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFirmas(data.firmas);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar firmas:", err);
        setLoading(false);
      });
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const firmasFiltradas = firmas.filter((firma) =>
    firma.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-6 relative">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-200 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Directorio de Firmas</h2>
          <p className="text-gray-500 mt-2">Gestión de autoridades y firmas digitales autorizadas en el sistema.</p>
        </div>
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">folder_shared</span>
          Total registradas: {firmas.length}
        </div>
      </div>

      {/* --- NUEVO: BARRA DE BÚSQUEDA --- */}
      {!loading && firmas.length > 0 && (
        <div className="relative w-full md:w-1/2">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar firma por nombre de la autoridad..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] transition-shadow shadow-sm bg-white"
          />
        </div>
      )}

      {/* Estado de Carga */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
          <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
          <p className="font-medium">Cargando firmas desde la base de datos...</p>
        </div>
      )}

      {/* Estado Vacío (Si no hay firmas en la BD) */}
      {!loading && firmas.length === 0 && (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
             <span className="material-symbols-outlined text-5xl text-gray-300">folder_off</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">No hay firmas disponibles</h3>
          <p className="text-gray-500 mt-2">Aún no se ha registrado ninguna identidad digital.</p>
        </div>
      )}

      {/* Estado Vacío (Si la búsqueda no arroja resultados) */}
      {!loading && firmas.length > 0 && firmasFiltradas.length === 0 && (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">search_off</span>
          <h3 className="text-lg font-bold text-gray-700">No se encontraron resultados</h3>
          <p className="text-gray-500">No hay ninguna autoridad que coincida con "{busqueda}".</p>
        </div>
      )}

      {/* Grilla de Tarjetas de Firmas (Usando firmasFiltradas) */}
      {!loading && firmasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firmasFiltradas.map((firma) => (
            <div key={firma.id_usuario} className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              
              {/* Cabecera de la tarjeta: Foto y Nombre */}
              <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <img 
                  src={firma.foto_perfil_url} 
                  alt={firma.nombre_completo} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} // Imagen por defecto si falla
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-lg leading-tight truncate">{firma.nombre_completo}</h4>
                  <p className="text-[10px] text-[#8B1A1A] font-bold mt-1 bg-red-50 inline-block px-2 py-1 rounded uppercase tracking-wider">
                    Autoridad Registrada
                  </p>
                </div>
              </div>

              {/* Cuerpo de la tarjeta: Firma Digital */}
              <div className="p-6 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4 w-full text-left flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">draw</span> Firma Digital
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-4 w-full h-32 flex items-center justify-center group-hover:border-[#8B1A1A]/30 transition-colors">
                  <img 
                    src={firma.firma_digital_url} 
                    alt={`Firma de ${firma.nombre_completo}`} 
                    className="max-h-full max-w-full object-contain mix-blend-multiply" 
                  />
                </div>
              </div>

              {/* Pie de tarjeta: Acciones */}
              <div className="px-6 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium font-mono bg-white px-2 py-1 border border-gray-200 rounded">ID: {firma.id_usuario}</span>
                
                {/* --- NUEVO: BOTÓN DE ZOOM ACTUALIZADO --- */}
                <button 
                  onClick={() => setFirmaEnZoom(firma)}
                  className="text-[#8B1A1A] hover:bg-red-50 p-2 rounded-full transition-colors flex items-center gap-1"
                  title="Ver firma en detalle"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- NUEVO: MODAL (VISOR DE ZOOM) --- */}
      {firmaEnZoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setFirmaEnZoom(null)} // Cierra al hacer clic fuera
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro de la tarjeta
          >
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <img 
                  src={firmaEnZoom.foto_perfil_url} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-none">{firmaEnZoom.nombre_completo}</h3>
                  <span className="text-xs text-gray-500">Vista detallada de firma autorizada</span>
                </div>
              </div>
              <button 
                onClick={() => setFirmaEnZoom(null)}
                className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full p-2 border border-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-xl block">close</span>
              </button>
            </div>
            
            {/* Contenedor de la Imagen */}
            <div className="p-8 bg-[#f8fafc] flex justify-center items-center min-h-[40vh]">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full flex justify-center">
                <img 
                  src={firmaEnZoom.firma_digital_url} 
                  alt="Firma Zoom" 
                  className="w-full max-h-[50vh] object-contain mix-blend-multiply" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}