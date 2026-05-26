'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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

export default function EmitirCertificadoPage() { 
  const params = useParams(); 
  const tramiteId = params.id; 
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const firmaIdURL = searchParams.get('firmaId');

  // --- ESTADOS ---
  const [firmas, setFirmas] = useState<FirmaData[]>([]);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [datosTramite, setDatosTramite] = useState<TramiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          console.error("Error: La API no devolvió una lista de trámites.", dataTramites);
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

 const handleImprimir = () => {
    // Un pequeño retraso de 100ms asegura que la página esté lista
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleFinalizar = async () => {
    const result = await Swal.fire({
      title: '¿Emitir Certificado?',
      text: "Esta acción finalizará el trámite de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8B1A1A',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, emitir',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tramites/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tramiteId: tramiteId,
          firmaId: firmaIdURL,
          usuarioOperadorId: 4 
        }),
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: '¡Emitido!',
          text: 'El certificado ha sido generado exitosamente.',
          icon: 'success',
          confirmButtonColor: '#8B1A1A'
        });
        router.push('/tramites/transacciones'); 
      } else {
        Swal.fire({
          title: 'Error',
          text: data.error || 'Hubo un error al emitir el certificado.',
          icon: 'error',
          confirmButtonColor: '#8B1A1A'
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo comunicar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#8B1A1A'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const firmaActual = firmas.find(f => f.id_usuario.toString() === firmaIdURL);

  const codigoSeguridad = datosTramite ? `J5SH5CF${datosTramite.id_tramite}` : '';

  // --- RENDERIZADO CONDICIONAL ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
        <p className="text-gray-500 font-medium">Cargando vista previa de emisión...</p>
      </div>
    );
  }

  if (!datosTramite) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
        <h2 className="text-xl font-bold text-gray-700">Trámite no encontrado</h2>
        <p className="text-gray-500">No se encontró ningún trámite con el ID: {tramiteId}</p>
      </div>
    );
  }

  // --- INTERFAZ PRINCIPAL ---
  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 bg-[#f8fafc] print:bg-white print:p-0 min-h-screen">
      
      {/* Encabezado Principal (Oculto al imprimir) */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4 print:hidden">
        <button 
          onClick={() => router.push(`/tramites/revisar/${tramiteId}`)}
          className="text-gray-500 hover:text-[#8B1A1A] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="font-bold text-gray-800 text-lg">Vista Previa de Emisión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
        
        {/* COLUMNA IZQUIERDA: Certificado y Botones */}
        <div className="lg:col-span-2 flex flex-col items-center print:w-full">
          
          {/* Tarjeta del Certificado (Se expande al 100% al imprimir) */}
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-sm border border-gray-100 p-10 relative print:border-none print:shadow-none print:p-4">
            
            <div className="text-center mb-8">
              <p className="text-xs text-gray-500 mb-4">Resolución Ministerial N° 0068/2023 de 15 de marzo de 2023</p>
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest border-b border-gray-800 pb-2 inline-block">
                {datosTramite.tipo_tramite}
              </h1>
            </div>

            <div className="border border-gray-200 p-4 rounded-md mb-6 bg-gray-50/50 print:bg-transparent">
              <p className="text-sm text-gray-600">
                El Ministerio de Educación del Estado Plurinacional de Bolivia, a través de la Dirección General de Educación Superior Universitaria, certifica a favor de:
              </p>
            </div>

            <div className="bg-[#eaf4ff] py-4 px-4 rounded-md mb-8 text-center border border-blue-100 print:bg-gray-100 print:border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                {datosTramite.nombre_completo}
              </h2>
            </div>

            {/* Tabla de Detalles */}
            <div className="mb-8">
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-700 w-2/5 text-center bg-gray-50">Detalle del documento:</td>
                    <td className="border border-gray-200 p-4 text-center text-gray-700">{datosTramite.tipo_tramite}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-700 text-center bg-gray-50">Firmado por:</td>
                    <td className="border border-gray-200 p-4 text-center text-gray-700">
                      {firmaActual ? firmaActual.nombre_completo : "Pendiente de asignación"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-700 text-center bg-gray-50">Fecha:</td>
                    <td className="border border-gray-200 p-4 text-center text-gray-700">
                      {new Date(datosTramite.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-700 text-center bg-gray-50">Responsable:</td>
                    <td className="border border-gray-200 p-4 text-center text-gray-700">UNIVALLE</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-700 text-center bg-gray-50">N° de certificado:</td>
                    <td className="border border-gray-200 p-4 text-center text-gray-700">{datosTramite.codigo_tramite}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-4 font-semibold text-gray-700 text-center bg-gray-50">Código de seguridad:</td>
                    <td className="border border-gray-200 p-4 text-center text-gray-700 font-mono bg-gray-50">{codigoSeguridad}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer del certificado (Texto + QR) */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-xs text-gray-500 max-w-[60%] text-justify leading-relaxed">
                Se certifica que la firma que antecede corresponde al funcionario autorizado y que el presente documento tiene plena validez legal conforme a la normativa vigente.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-28 h-28 flex flex-col items-center justify-center text-gray-400 bg-gray-50 print:bg-transparent print:border-solid print:border-gray-400">
                <span className="material-symbols-outlined text-4xl mb-1">qr_code_2</span>
                <span className="text-[9px] text-center leading-tight">Escanee el código QR para verificar</span>
              </div>
            </div>
            
          </div>

          {/* Botones de Acción (Ocultos al imprimir, debajo del certificado como en Figma) */}
          <div className="flex gap-4 w-full max-w-3xl mt-6 justify-center print:hidden">
            <button 
              onClick={handleFinalizar}
              disabled={isSubmitting}
              className={`bg-[#8B1A1A] hover:bg-[#701515] text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-1 max-w-[250px] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`material-symbols-outlined text-xl ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : 'upload'}
              </span>
              {isSubmitting ? 'EMITIENDO...' : 'FINALIZAR Y EMITIR'}
            </button>
            <button 
              onClick={handleImprimir}
              className="bg-[#334155] hover:bg-[#1e293b] text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-1 max-w-[200px]"
            >
              <span className="material-symbols-outlined text-xl">print</span>
              Imprimir
            </button>
          </div>

        </div>

        {/* COLUMNA DERECHA: Controles (Oculta al imprimir) */}
        <div className="space-y-6 print:hidden">
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Información de la Solicitud</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Solicitante</p>
                <p className="font-medium text-gray-800">{datosTramite.nombre_completo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado actual</p>
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {datosTramite.nombre_estado}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta Adjuntar PDF */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Adjuntar Respaldo Adicional</h3>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#8B1A1A] hover:bg-red-50/30 transition-colors group">
              <input type="file" accept=".pdf" className="hidden" onChange={handlePDFChange} />
              {archivoPDF ? (
                <>
                  <span className="material-symbols-outlined text-3xl text-green-500 mb-2">picture_as_pdf</span>
                  <p className="font-bold text-gray-700 text-sm">{archivoPDF.name}</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-gray-400 mb-2 group-hover:text-[#8B1A1A]">cloud_upload</span>
                  <p className="font-bold text-gray-700 text-sm">Subir PDF</p>
                </>
              )}
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}