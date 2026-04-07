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

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-8">
      
      {/* Encabezado */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Directorio de Firmas</h2>
          <p className="text-gray-500 mt-2">Gestión de autoridades y firmas digitales autorizadas en el sistema.</p>
        </div>
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">
          Total registradas: {firmas.length}
        </div>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
          <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
          <p className="font-medium">Cargando firmas desde la base de datos...</p>
        </div>
      )}

      {/* Estado Vacío (Si no hay firmas) */}
      {!loading && firmas.length === 0 && (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="material-symbols-outlined text-5xl text-gray-300">folder_off</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">No hay firmas disponibles</h3>
          <p className="text-gray-500 mt-2">Aún no se ha registrado ninguna identidad digital.</p>
        </div>
      )}

      {/* Grilla de Tarjetas de Firmas */}
      {!loading && firmas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firmas.map((firma) => (
            <div key={firma.id_usuario} className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              
              {/* Cabecera de la tarjeta: Foto y Nombre */}
              <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <img 
                  src={firma.foto_perfil_url} 
                  alt={firma.nombre_completo} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} // Imagen por defecto si falla
                />
                <div>
                  <h4 className="font-bold text-gray-800 text-lg leading-tight">{firma.nombre_completo}</h4>
                  <p className="text-xs text-[#8B1A1A] font-bold mt-1 bg-red-50 inline-block px-2 py-1 rounded">
                    Autoridad / Estudiante
                  </p>
                </div>
              </div>

              {/* Cuerpo de la tarjeta: Firma Digital */}
              <div className="p-6 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4 w-full text-left">
                  Firma Digital Registrada
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
                <span className="text-xs text-gray-400 font-medium">ID Usuario: {firma.id_usuario}</span>
                <button className="text-[#8B1A1A] hover:bg-red-50 p-2 rounded-full transition-colors tooltip">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}