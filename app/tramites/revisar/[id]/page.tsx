'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface FirmaData {
  id_usuario: number;
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
  fecha_creacion: string;
}

export default function RevisarTramitePage() {
  const params = useParams(); 
  const tramiteId = params.id; 
  const router = useRouter(); 

  // --- ESTADOS ---
  const [firmas, setFirmas] = useState<FirmaData[]>([]);
  const [firmaSeleccionada, setFirmaSeleccionada] = useState<string>('');
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [datosTramite, setDatosTramite] = useState<TramiteData | null>(null);
  const [loading, setLoading] = useState(true);

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
        } else {
          console.error("Error: La API no devolvió una lista de trámites. Devolvió:", dataTramites);
        }
      })
      .catch((err) => console.error("Error cargando datos desde la BD:", err))
      .finally(() => setLoading(false));
  }, [tramiteId]);

  // --- FUNCIONES ---
  const handlePDFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoPDF(e.target.files[0]);
    }
  };

  const handleGenerarCertificado = () => {
    if (!firmaSeleccionada) {
      // Mensaje de validación estilizado con SweetAlert2
      Swal.fire({
        title: 'Firma Requerida',
        text: 'Por favor, selecciona una autoridad firmante antes de generar el certificado.',
        icon: 'warning',
        confirmButtonColor: '#8B1A1A',
        confirmButtonText: 'Entendido',
        background: '#ffffff',
        customClass: {
          confirmButton: 'rounded-lg px-6 py-2 font-bold'
        }
      });
      return;
    }
    router.push(`/tramites/emitir/${tramiteId}?firmaId=${firmaSeleccionada}`);
  };

  const firmaActual = firmas.find(f => f.id_usuario.toString() === firmaSeleccionada);

  // --- RENDERIZADO CONDICIONAL ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
        <p className="text-gray-500 font-medium">Buscando el trámite {tramiteId} en la base de datos...</p>
      </div>
    );
  }

  if (!datosTramite) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
        <h2 className="text-xl font-bold text-gray-700">Trámite no encontrado</h2>
        <p className="text-gray-500">No se encontró ningún trámite pagado con el ID: {tramiteId}</p>
      </div>
    );
  }

  // --- INTERFAZ PRINCIPAL ---
  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-[#8B1A1A] transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-2xl font-normal text-gray-700">
          Revisar Trámite: <span className="font-bold text-[#8B1A1A]">{datosTramite.tipo_tramite}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Visor */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <span className="font-bold text-gray-700 text-sm">Documento de Solicitud ({datosTramite.codigo_tramite})</span>
          </div>
          <div className="bg-[#1c2536] p-8 flex-1 flex justify-center items-center min-h-[600px]">
            <div className="bg-white w-full max-w-lg min-h-[500px] p-12 shadow-lg relative">
              <h1 className="text-3xl font-black text-center text-[#8B1A1A] mb-8 border-b-2 border-[#8B1A1A] pb-4">UNIVALLE</h1>
              <div className="space-y-4 text-sm text-gray-700">
                <p><span className="text-gray-500 mr-2 font-semibold">Solicitante:</span> {datosTramite.nombre_completo}</p>
                <p><span className="text-gray-500 mr-2 font-semibold">Correo:</span> {datosTramite.correo}</p>
                <p><span className="text-gray-500 mr-2 font-semibold">Trámite:</span> {datosTramite.tipo_tramite}</p>
                
                {firmaActual && (
                  <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <img src={firmaActual.firma_digital_url} alt="Firma" className="h-20 object-contain mix-blend-multiply" />
                    <div className="border-t border-gray-400 w-48 mt-2 text-center text-xs text-gray-500 pt-1 font-medium">
                      {firmaActual.nombre_completo}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Controles */}
        <div className="space-y-6">
          
          {/* Tarjeta Información */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">person</span> Información del Solicitante
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Nombre Completo</p>
                <p className="font-medium text-gray-800">{datosTramite.nombre_completo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado del Trámite</p>
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {datosTramite.nombre_estado}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta Selector de Firmas Mejorado */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">draw</span> Autoridad Firmante
            </h3>
            <p className="text-xs text-gray-500 mb-4">Seleccione la autoridad responsable de firmar este documento:</p>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {firmas.map((firma) => (
                <div 
                  key={firma.id_usuario}
                  onClick={() => setFirmaSeleccionada(firma.id_usuario.toString())}
                  className={`relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    firmaSeleccionada === firma.id_usuario.toString() 
                      ? 'border-[#8B1A1A] bg-red-50/30 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  {/* Radio button visual */}
                  <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                    firmaSeleccionada === firma.id_usuario.toString() ? 'border-[#8B1A1A]' : 'border-gray-300'
                  }`}>
                    {firmaSeleccionada === firma.id_usuario.toString() && (
                      <div className="w-2 h-2 rounded-full bg-[#8B1A1A]" />
                    )}
                  </div>
                  
                  {/* Info de la firma */}
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-800 truncate">{firma.nombre_completo}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Autorizado</p>
                    </div>
                    {/* Miniatura de la firma */}
                    <img 
                      src={firma.firma_digital_url} 
                      alt="Firma miniatura" 
                      className="h-8 w-16 object-contain mix-blend-multiply opacity-60" 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {firmas.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <span className="material-symbols-outlined text-3xl mb-2">history_edu</span>
                <p className="text-sm">No hay firmas registradas.</p>
              </div>
            )}
          </div>

          {/* Tarjeta Adjuntar PDF */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">attach_file</span> Adjuntar Respaldo (Opcional)
            </h3>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#8B1A1A] hover:bg-red-50/30 transition-colors group">
              <input type="file" accept=".pdf" className="hidden" onChange={handlePDFChange} />
              {archivoPDF ? (
                <div className="flex flex-col items-center text-green-600">
                  <span className="material-symbols-outlined text-3xl mb-2">check_circle</span>
                  <p className="font-bold text-sm truncate max-w-[200px]">{archivoPDF.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Clic para cambiar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-[#8B1A1A]">
                  <span className="material-symbols-outlined text-3xl mb-2 transition-transform group-hover:-translate-y-1">cloud_upload</span>
                  <p className="font-bold text-sm">Subir PDF</p>
                </div>
              )}
            </label>
          </div>

          {/* Botón Principal */}
          <button 
            onClick={handleGenerarCertificado}
            className="w-full bg-[#8B1A1A] hover:bg-[#701515] active:bg-[#5a1111] text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">workspace_premium</span>
            Continuar a Emisión
          </button>
        </div>
      </div>
    </div>
  );
}