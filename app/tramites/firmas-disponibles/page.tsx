'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Añadimos id_rol a la interfaz
interface FirmaData {
  id_usuario: number;
  id_rol?: number; 
  nombre_completo: string;
  foto_perfil_url: string;
  firma_digital_url: string;
}

export default function FirmasDisponiblesPage() {
  const [firmas, setFirmas] = useState<FirmaData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [busqueda, setBusqueda] = useState('');
  const [firmaEnZoom, setFirmaEnZoom] = useState<FirmaData | null>(null);
  const [firmaEnEdicion, setFirmaEnEdicion] = useState<FirmaData | null>(null);
  
  // Estados para el formulario de edición
  const [editNombre, setEditNombre] = useState('');
  const [editRol, setEditRol] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Función para traducir el número de rol a texto (Según tu BD)
  const obtenerNombreRol = (id_rol?: number) => {
    switch (id_rol) {
      case 5: return "Director de Carrera";
      case 6: return "Vicerrector Académico";
      case 7: return "Rector";
      case 1: return "Estudiante";
      default: return "Autoridad Asignada";
    }
  };

  const cargarFirmas = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    cargarFirmas();
  }, []);

  const firmasFiltradas = firmas.filter((firma) =>
    firma.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Abrir el modal de edición y cargar los datos actuales
  const abrirEdicion = (firma: FirmaData) => {
    setFirmaEnEdicion(firma);
    setEditNombre(firma.nombre_completo);
    setEditRol(firma.id_rol || 5); // Por defecto Director si no tiene rol
  };

  // Función para guardar los cambios en la BD
  const guardarEdicion = async () => {
    if (!firmaEnEdicion) return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/editar-firma', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: firmaEnEdicion.id_usuario,
          nombre_completo: editNombre,
          id_rol: editRol
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Los datos de la autoridad han sido guardados.',
          icon: 'success',
          confirmButtonColor: '#8B1A1A'
        });
        setFirmaEnEdicion(null);
        cargarFirmas(); // Recargamos la lista para ver los cambios
      } else {
        Swal.fire('Error', data.error || 'No se pudo actualizar', 'error');
      }
    } catch (error) {
      console.error("Error al editar:", error);
      Swal.fire('Error', 'Problema de conexión con el servidor', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
                  {/* AQUÍ MOSTRAMOS EL ROL EN LUGAR DE "AUTORIDAD" GENÉRICO */}
                  <p className={`text-[10px] text-white font-bold mt-1 inline-block px-2 py-1 rounded uppercase tracking-wider ${firma.id_rol === 7 ? 'bg-[#8B1A1A]' : 'bg-black'}`}>
                    {obtenerNombreRol(firma.id_rol)}
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

              {/* Pie de tarjeta con Botones de Acción */}
              <div className="px-6 py-3 bg-gray-100 flex justify-end gap-3 items-center border-t-2 border-black">
                
                <button 
                  onClick={() => abrirEdicion(firma)}
                  className="text-black bg-white hover:bg-gray-200 font-bold px-4 py-2 text-sm flex items-center gap-2 rounded-lg transition-all border-2 border-black"
                >
                  <span className="material-symbols-outlined text-lg">edit</span> Editar
                </button>

                <button 
                  onClick={() => setFirmaEnZoom(firma)}
                  className="text-white bg-black hover:bg-[#8B1A1A] font-bold px-4 py-2 text-sm flex items-center gap-2 rounded-lg transition-all border-2 border-black"
                >
                  <span className="material-symbols-outlined text-lg">visibility</span> Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
      {firmaEnEdicion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-black animate-in zoom-in-95">
            
            <div className="px-6 py-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-black text-xl">Editar Autoridad</h3>
              <button onClick={() => setFirmaEnEdicion(null)} className="text-black hover:text-[#8B1A1A] transition-colors">
                <span className="material-symbols-outlined text-2xl block">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] bg-white text-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Rol Asignado</label>
                <select 
                  value={editRol}
                  onChange={(e) => setEditRol(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] bg-white text-black font-semibold appearance-none"
                >
                  <option value={5}>Director de Carrera</option>
                  <option value={6}>Vicerrector Académico</option>
                  <option value={7}>Rector</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-100 border-t-2 border-black flex justify-end gap-3">
              <button 
                onClick={() => setFirmaEnEdicion(null)}
                className="px-5 py-2 font-bold text-black bg-white border-2 border-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarEdicion}
                disabled={isSaving}
                className="px-5 py-2 font-bold text-white bg-[#8B1A1A] border-2 border-black rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE ZOOM (Se mantiene igual) */}
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
                  <span className="text-xs font-bold text-black uppercase">{obtenerNombreRol(firmaEnZoom.id_rol)}</span>
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