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
  
  // Estados
  const [busqueda, setBusqueda] = useState('');
  const [firmaEnZoom, setFirmaEnZoom] = useState<FirmaData | null>(null);

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

  const firmasFiltradas = firmas.filter((firma) =>
    firma.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-6 relative text-black">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-black pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Directorio de Firmas</h2>
          <p className="text-gray-800 mt-2 font-medium">Gestión de autoridades y firmas digitales autorizadas en el sistema.</p>
        </div>
        <div className="bg-gray-200 text-black px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 border border-black">
          <span className="material-symbols-outlined text-lg">folder_shared</span>
          Total registradas: {firmas.length}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      {!loading && firmas.length > 0 && (
        <div className="relative w-full md:w-1/2">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-black">search</span>
          <input 
            type="text" 
            placeholder="Buscar firma por nombre de la autoridad..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] transition-shadow shadow-sm bg-white text-black font-semibold placeholder-gray-600"
          />
        </div>
      )}

      {/* Estado de Carga */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-black space-y-4">
          <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
          <p className="font-bold">Cargando firmas desde la base de datos...</p>
        </div>
      )}

      {/* Estado Vacío */}
      {!loading && firmas.length === 0 && (
        <div className="bg-white rounded-[20px] shadow-sm border-2 border-black p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
             <span className="material-symbols-outlined text-5xl text-black">folder_off</span>
          </div>
          <h3 className="text-xl font-bold text-black">No hay firmas disponibles</h3>
          <p className="text-gray-800 mt-2 font-medium">Aún no se ha registrado ninguna identidad digital.</p>
        </div>
      )}

      {/* Estado Búsqueda vacía */}
      {!loading && firmas.length > 0 && firmasFiltradas.length === 0 && (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-black mb-4">search_off</span>
          <h3 className="text-lg font-bold text-black">No se encontraron resultados</h3>
          <p className="text-gray-800 font-medium">No hay ninguna autoridad que coincida con "{busqueda}".</p>
        </div>
      )}

      {/* Grilla de Tarjetas */}
      {!loading && firmasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firmasFiltradas.map((firma) => (
            <div key={firma.id_usuario} className="bg-white rounded-[20px] shadow-sm border-2 border-black overflow-hidden hover:shadow-lg transition-shadow group">
              
              {/* Cabecera */}
              <div className="p-6 border-b-2 border-black flex items-center gap-4 bg-gray-50">
                <img 
                  src={firma.foto_perfil_url} 
                  alt={firma.nombre_completo} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-black shadow-sm"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-black text-lg leading-tight truncate">{firma.nombre_completo}</h4>
                  <p className="text-[10px] text-white bg-black font-bold mt-1 inline-block px-2 py-1 rounded uppercase tracking-wider">
                    Autoridad
                  </p>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-6 flex flex-col items-center justify-center">
                <p className="text-xs text-black uppercase tracking-wider font-black mb-4 w-full text-left flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">draw</span> Firma Digital
                </p>
                <div className="bg-white border-2 border-black rounded-xl p-4 w-full h-32 flex items-center justify-center group-hover:border-[#8B1A1A] transition-colors">
                  <img 
                    src={firma.firma_digital_url} 
                    alt={`Firma de ${firma.nombre_completo}`} 
                    className="max-h-full max-w-full object-contain mix-blend-multiply" 
                  />
                </div>
              </div>

              {/* Pie de tarjeta */}
              <div className="px-6 py-3 bg-gray-100 flex justify-between items-center border-t-2 border-black">
                <span className="text-xs text-black font-black font-mono bg-white px-2 py-1 border-2 border-black rounded">ID: {firma.id_usuario}</span>
                <button 
                  onClick={() => setFirmaEnZoom(firma)}
                  className="text-black bg-white hover:bg-black hover:text-white p-2 rounded-full transition-all border-2 border-black"
                  title="Ver firma en detalle"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {firmaEnZoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setFirmaEnZoom(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border-2 border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <img 
                  src={firmaEnZoom.foto_perfil_url} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-black"
                />
                <div>
                  <h3 className="font-black text-black text-lg leading-none">{firmaEnZoom.nombre_completo}</h3>
                  <span className="text-xs font-bold text-black uppercase">Vista detallada</span>
                </div>
              </div>
              <button 
                onClick={() => setFirmaEnZoom(null)}
                className="text-black hover:text-white bg-white hover:bg-black rounded-full p-2 border-2 border-black transition-colors"
              >
                <span className="material-symbols-outlined text-xl block">close</span>
              </button>
            </div>
            
            <div className="p-8 bg-gray-100 flex justify-center items-center min-h-[40vh]">
              <div className="bg-white p-6 rounded-xl border-2 border-black shadow-lg w-full flex justify-center">
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