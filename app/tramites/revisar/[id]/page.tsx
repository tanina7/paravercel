'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface FirmaData {
  id_usuario: number;
  id_rol?: number; 
  nombre_completo: string;
  foto_perfil_url: string;
  firma_digital_url: string;
}

interface TramiteData {
  id_tramite: number;
  codigo_tramite: string;
  tipo_tramite: string;
  nombre_estado: string;
  nombre_completo: string;
  correo: string;
  ci?: string;       
  carrera?: string;  
  sede?: string;     
  fecha_creacion: string;
}

export default function RevisarTramitePage() {
  const params = useParams(); 
  const tramiteId = params.id; 
  const router = useRouter(); 

  // --- ESTADOS ---
  const [firmas, setFirmas] = useState<FirmaData[]>([]);
  const [firmasSeleccionadas, setFirmasSeleccionadas] = useState<string[]>([]);
  const [datosTramite, setDatosTramite] = useState<TramiteData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [busquedaFirma, setBusquedaFirma] = useState('');
  // NUEVO: Estado para controlar si mostramos todas las firmas o solo las 3 primeras
  const [mostrarTodasFirmas, setMostrarTodasFirmas] = useState(false);

  // Función para traducir el rol a texto
  const obtenerNombreRol = (id_rol?: number) => {
    switch (id_rol) {
      case 5: return "Director de Carrera";
      case 6: return "Vicerrector Académico";
      case 7: return "Rector";
      case 1: return "Estudiante";
      default: return "Autoridad";
    }
  };

  // --- EFECTO PARA CARGAR DATOS ---
  useEffect(() => {
    const cargarFirmas = fetch('/api/obtener-firmas').then(res => res.json());
    const cargarTramites = fetch('/api/tramites/solicitudes').then(res => res.json());

    Promise.all([cargarFirmas, cargarTramites])
      .then(([dataFirmas, dataTramites]) => {
        if (dataFirmas.success) setFirmas(dataFirmas.firmas);
        
        if (Array.isArray(dataTramites)) {
          const tramiteEncontrado = dataTramites.find(
            (t) => t.id_tramite.toString() === tramiteId
          );
          setDatosTramite(tramiteEncontrado || null);
        }
      })
      .catch((err) => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));
  }, [tramiteId]);

  const toggleFirma = (id: string) => {
    setFirmasSeleccionadas((prev) => 
      prev.includes(id) 
        ? prev.filter(firmaId => firmaId !== id) 
        : [...prev, id] 
    );
  };

  const handleGenerarCertificado = () => {
    if (firmasSeleccionadas.length === 0) {
      Swal.fire({
        title: 'Firmas Requeridas',
        text: 'Por favor, selecciona al menos una autoridad firmante antes de generar el certificado.',
        icon: 'warning',
        confirmButtonColor: '#8B1A1A',
        confirmButtonText: 'Entendido',
        customClass: { confirmButton: 'rounded-lg px-6 py-2 font-bold' }
      });
      return;
    }
    router.push(`/tramites/emitir/${tramiteId}?firmasIds=${firmasSeleccionadas.join(',')}`);
  };

  const firmasActuales = firmas.filter(f => firmasSeleccionadas.includes(f.id_usuario.toString()));

  // Lógica de filtrado
  const firmasFiltradas = firmas.filter(f => {
    const termino = busquedaFirma.toLowerCase();
    return (
      f.nombre_completo.toLowerCase().includes(termino) ||
      obtenerNombreRol(f.id_rol).toLowerCase().includes(termino)
    );
  });

  // NUEVO: Calculamos cuántas firmas mostrar (3 o todas)
  const firmasAMostrar = mostrarTodasFirmas ? firmasFiltradas : firmasFiltradas.slice(0, 3);
  const firmasRestantes = firmasFiltradas.length - 3;

  // --- RENDERIZADO CONDICIONAL ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-4">
        <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
        <p className="text-gray-500 font-bold tracking-wide">Cargando expediente del trámite...</p>
      </div>
    );
  }

  if (!datosTramite) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
        <h2 className="text-xl font-bold text-gray-700">Trámite no encontrado</h2>
        <p className="text-gray-500">No se pudo cargar la información del ID: {tramiteId}</p>
        <button onClick={() => router.back()} className="text-[#8B1A1A] font-bold hover:underline">Volver</button>
      </div>
    );
  }

  // --- INTERFAZ PRINCIPAL ---
  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-gray-400 hover:text-[#8B1A1A] transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200"
          >
            <span className="material-symbols-outlined text-xl block">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              Pre-visualización de Emisión
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Validación y firma de documento <span className="font-bold text-[#8B1A1A]">#{datosTramite.codigo_tramite}</span>
            </p>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
          <span className="font-bold text-green-700 text-sm">Pago Verificado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ==============================================
            COLUMNA IZQUIERDA: VISOR DEL DOCUMENTO
        ============================================== */}
        <div className="lg:col-span-8 flex flex-col bg-gray-100/50 rounded-2xl border border-gray-200 overflow-hidden shadow-inner">
          
          <div className="p-3 bg-gray-800 text-gray-300 text-xs font-mono flex justify-between items-center px-6">
            <span>DOCUMENTO PRELIMINAR - MODO VISTA PREVIA</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">zoom_in</span> 100%</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center items-start min-h-[700px] custom-scrollbar">
            
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col p-12 lg:p-16 ring-1 ring-gray-200">
              
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <h1 className="text-9xl font-black text-gray-900 rotate-[-45deg] tracking-widest">UNIVALLE</h1>
              </div>

              <div className="text-center border-b-2 border-[#8B1A1A] pb-8 mb-10 relative z-10">
                <div className="w-16 h-16 bg-[#8B1A1A] mx-auto rounded-lg mb-4 flex items-center justify-center shadow-md">
                   <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-widest">UNIVALLE</h1>
                <p className="text-[#8B1A1A] text-sm font-bold uppercase tracking-widest mt-2">Documento Oficial de Trámite</p>
              </div>

              <div className="space-y-6 text-gray-800 relative z-10 flex-1">
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl text-center mb-8">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Se expide el presente documento a favor de:</p>
                  <h2 className="text-2xl font-black text-gray-900">{datosTramite.nombre_completo}</h2>
                  <p className="text-gray-600 font-mono mt-2 bg-white inline-block px-3 py-1 rounded border border-gray-200 shadow-sm">
                    C.I. {datosTramite.ci || 'Sin registrar'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Trámite Solicitado</p>
                    <p className="font-bold text-lg text-gray-800 mt-1">{datosTramite.tipo_tramite}</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Código de Registro</p>
                    <p className="font-mono text-gray-800 mt-1">{datosTramite.codigo_tramite}</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Carrera del Solicitante</p>
                    <p className="font-bold text-gray-800 mt-1">{datosTramite.carrera || 'No especificada'}</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Sede Académica</p>
                    <p className="font-bold text-gray-800 mt-1">{datosTramite.sede || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* FIRMAS EN EL DOCUMENTO */}
              <div className="mt-16 pt-8 border-t border-gray-100 min-h-[150px] relative z-10">
                {firmasActuales.length > 0 ? (
                  <div className="flex justify-center items-end gap-10 flex-wrap px-4">
                    {firmasActuales.map((firma) => (
                      <div key={firma.id_usuario} className="flex flex-col items-center animate-in zoom-in duration-300">
                        <img 
                          src={firma.firma_digital_url} 
                          alt="Firma" 
                          className="h-20 object-contain mix-blend-multiply" 
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                          }}
                        />
                        <div className="border-t-2 border-gray-800 w-48 mt-2 text-center text-[10px] text-gray-700 pt-2 font-black uppercase leading-tight tracking-wider">
                          {firma.nombre_completo}
                          <span className="block font-normal text-gray-500 mt-0.5">{obtenerNombreRol(firma.id_rol)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 h-full">
                    <span className="material-symbols-outlined text-5xl mb-2 opacity-50">edit_document</span>
                    <p className="text-sm font-medium uppercase tracking-widest">Espacio para Firmas</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ==============================================
            COLUMNA DERECHA: PANELES DE CONTROL
        ============================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Tarjeta 1: Información del Estudiante */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0 opacity-50"></div>
            
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-[#8B1A1A]">person_book</span> 
              Datos del Estudiante
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {datosTramite.nombre_completo.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{datosTramite.nombre_completo}</p>
                  <p className="text-xs text-gray-500 truncate">{datosTramite.correo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">C.I. / Documento</p>
                  <p className="font-mono text-sm text-gray-800 font-semibold">{datosTramite.ci || 'N/A'}</p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Sede</p>
                  <p className="text-sm text-gray-800 font-semibold truncate">{datosTramite.sede || 'N/A'}</p>
                </div>
                <div className="col-span-2 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Carrera</p>
                  <p className="text-sm text-gray-800 font-semibold truncate">{datosTramite.carrera || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Selector de Firmas (CON BUSCADOR Y DESPLEGABLE) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B1A1A]">ink_pen</span> 
                Asignar Firmas
              </h3>
              <span className="bg-[#8B1A1A] text-white text-[10px] font-black px-2 py-1 rounded-full">
                {firmasSeleccionadas.length} seleccionadas
              </span>
            </div>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-sm">search</span>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o cargo..."
                value={busquedaFirma}
                onChange={(e) => setBusquedaFirma(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 focus:bg-white focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] outline-none transition-all placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar transition-all duration-300">
              {firmasAMostrar.length > 0 ? (
                <>
                  {firmasAMostrar.map((firma) => {
                    const isSelected = firmasSeleccionadas.includes(firma.id_usuario.toString());
                    
                    return (
                      <div 
                        key={firma.id_usuario}
                        onClick={() => toggleFirma(firma.id_usuario.toString())}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                          isSelected 
                            ? 'border-[#8B1A1A] bg-red-50/20 shadow-md' 
                            : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors border-2 ${
                          isSelected ? 'border-[#8B1A1A] bg-[#8B1A1A]' : 'border-gray-300 bg-white group-hover:border-gray-400'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{firma.nombre_completo}</p>
                          <p className={`text-[10px] uppercase font-bold mt-0.5 ${isSelected ? 'text-[#8B1A1A]' : 'text-gray-500'}`}>
                            {obtenerNombreRol(firma.id_rol)}
                          </p>
                        </div>

                        <img 
                          src={firma.firma_digital_url} 
                          alt="Miniatura" 
                          className={`h-8 w-16 object-contain mix-blend-multiply transition-opacity ${isSelected ? 'opacity-100' : 'opacity-30'}`} 
                          crossOrigin="anonymous"
                        />
                      </div>
                    );
                  })}

                  {/* BOTÓN PARA DESPLEGAR/OCULTAR EL RESTO DE FIRMAS */}
                  {firmasFiltradas.length > 3 && (
                    <button
                      onClick={() => setMostrarTodasFirmas(!mostrarTodasFirmas)}
                      className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#8B1A1A] hover:bg-red-50 rounded-xl transition-colors border border-dashed border-gray-300"
                    >
                      {mostrarTodasFirmas ? (
                        <>
                          Mostrar menos firmas
                          <span className="material-symbols-outlined text-[16px]">expand_less</span>
                        </>
                      ) : (
                        <>
                          Ver {firmasRestantes} firmas más
                          <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-400 flex flex-col items-center">
                  <span className="material-symbols-outlined text-3xl mb-1 opacity-50">search_off</span>
                  <p className="text-xs">No se encontraron firmas</p>
                </div>
              )}
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN PRINCIPAL */}
          <button 
            onClick={handleGenerarCertificado}
            className="w-full bg-[#8B1A1A] hover:bg-[#6b1414] active:bg-[#4a0d0d] text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
          >
            Emitir Documento Oficial
            <span className="material-symbols-outlined font-bold">arrow_forward</span>
          </button>

        </div>
      </div>
    </div>
  );
}