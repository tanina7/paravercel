'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react'; 

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
  carrera?: string; 
  fecha_creacion: string;
  monto?: number | string; // <-- AÑADIDO: Para recibir el costo desde la API
}

export default function EmitirCertificadoPage() { 
  const params = useParams(); 
  const tramiteId = params.id; 
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const firmasIdsURL = searchParams.get('firmasIds') || '';

  // --- ESTADOS ---
  const [firmas, setFirmas] = useState<FirmaData[]>([]);
  const [archivosRespaldo, setArchivosRespaldo] = useState<File[]>([]);
  const [datosTramite, setDatosTramite] = useState<TramiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [baseUrl, setBaseUrl] = useState(''); 

  // --- EFECTO PARA CARGAR DATOS ---
  useEffect(() => {
    setBaseUrl(window.location.origin);

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
      .catch((err) => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));
  }, [tramiteId]);

  // --- FUNCIONES DE ARCHIVOS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivosRespaldo((prev) => [...prev, ...nuevosArchivos]);
    }
    e.target.value = ''; 
  };

  const eliminarArchivo = (indexAEliminar: number) => {
    setArchivosRespaldo((prev) => prev.filter((_, index) => index !== indexAEliminar));
  };

  const obtenerNombreRol = (id_rol?: number) => {
    switch (id_rol) {
      case 5: return "Director de Carrera";
      case 6: return "Vicerrector Académico";
      case 7: return "Rector";
      case 1: return "Estudiante";
      default: return "Autoridad";
    }
  };

  // =========================================================================
  // MOTOR GENERADOR DE PDF
  // =========================================================================
  const generarDocumentoFinal = async (): Promise<Blob> => {
    const domtoimage = await new Promise<any>((resolve, reject) => {
      if ((window as any).domtoimage) return resolve((window as any).domtoimage);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js';
      script.onload = () => resolve((window as any).domtoimage);
      script.onerror = () => reject(new Error('Error dom-to-image'));
      document.body.appendChild(script);
    });

    const jsPDF = await new Promise<any>((resolve, reject) => {
      if ((window as any).jspdf && (window as any).jspdf.jsPDF) return resolve((window as any).jspdf.jsPDF);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve((window as any).jspdf.jsPDF);
      script.onerror = () => reject(new Error('Error jsPDF'));
      document.body.appendChild(script);
    });

    const element = document.getElementById('certificado-pantalla');
    if (!element) throw new Error('No se encontró el certificado en pantalla.');

    let finalPdfBlob: Blob;

   try {
      const imgData = await domtoimage.toPng(element, {
        bgcolor: '#ffffff',
        // 🔥 EL ESCUDO: Filtramos las imágenes rotas para que no explote
        filter: (node: any) => {
          if (node.tagName === 'IMG') {
            // Si la imagen no cargó (dio 404), su ancho será 0. La ignoramos.
            if (node.naturalWidth === 0) return false;
          }
          // También ignoramos scripts que a veces causan conflictos
          if (node.tagName === 'SCRIPT') return false;
          
          return true;
        },
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      if (archivosRespaldo.length > 0) {
        const PDFLib = await new Promise<any>((resolve, reject) => {
          if ((window as any).PDFLib) return resolve((window as any).PDFLib);
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js';
          script.onload = () => resolve((window as any).PDFLib);
          script.onerror = () => reject(new Error('Error pdf-lib'));
          document.body.appendChild(script);
        });

        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        const mainDoc = await PDFDocument.load(pdf.output('arraybuffer'));
        const mainPages = await mergedPdf.copyPages(mainDoc, mainDoc.getPageIndices());
        mainPages.forEach((page: any) => mergedPdf.addPage(page));

        for (const file of archivosRespaldo) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const attachDoc = await PDFDocument.load(arrayBuffer);
            const attachPages = await mergedPdf.copyPages(attachDoc, attachDoc.getPageIndices());
            attachPages.forEach((page: any) => mergedPdf.addPage(page));
          } catch (err) {
            console.error(`Error al fusionar el archivo: ${file.name}`, err);
          }
        }

        const mergedPdfBytes = await mergedPdf.save();
        finalPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      } else {
        finalPdfBlob = pdf.output('blob');
      }
    } catch (error) {
      console.error("Fallo al generar imagen/pdf:", error);
      throw error;
    }

    return finalPdfBlob;
  };

  // --- BOTÓN DE IMPRIMIR ---
  const handleImprimir = async () => {
    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<h2 style="font-family: Arial; text-align: center; margin-top: 50px;">Generando documento con respaldos, por favor espere...</h2>');
    }

    try {
      const pdfBlob = await generarDocumentoFinal();
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      if (printWindow) {
        printWindow.location.href = blobUrl;
      } else {
        window.location.href = blobUrl;
      }
    } catch (error: any) {
      if (printWindow) printWindow.close();
      Swal.fire('Error', 'No se pudo generar el documento para imprimir.', 'error');
    } finally {
      setIsPrinting(false);
    }
  };

  // --- BOTÓN DE FINALIZAR ---
  const handleFinalizar = async () => {
    if (!firmasIdsURL || firmasIdsURL.trim() === '') {
      Swal.fire({
        title: 'Firmas Requeridas',
        text: 'No se encontraron autoridades firmantes para emitir este documento.',
        icon: 'warning',
        confirmButtonColor: '#8B1A1A',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Emitir Certificado?',
      text: "Esta acción finalizará el trámite de forma permanente y unirá los PDFs adjuntos.",
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
      const pdfBlob = await generarDocumentoFinal();
      const pdfFile = new File([pdfBlob], `certificado_completo_${tramiteId}.pdf`, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('tramiteId', tramiteId as string);
      formData.append('firmasIds', firmasIdsURL);
      formData.append('usuarioOperadorId', '4');
      formData.append('archivo', pdfFile);

      archivosRespaldo.forEach((file) => {
        formData.append('respaldo', file);
      });

      const response = await fetch('/api/tramites/finalizar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire('¡Emitido!', 'El certificado ha sido generado y fusionado exitosamente.', 'success');
        router.push('/tramites/transacciones');
      } else {
        Swal.fire('Error', data.error || 'Hubo un error al emitir el certificado.', 'error');
      }
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire('Error', error.message || 'No se pudo generar el certificado.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const arrayIds = firmasIdsURL.split(',').filter(id => id.trim() !== '');
  const firmasActuales = firmas.filter(f => arrayIds.includes(f.id_usuario.toString()));
  
  // VARIABLES DE SEGURIDAD Y VERIFICACIÓN
  const codigoSeguridad = datosTramite ? `UV-${new Date(datosTramite.fecha_creacion).getFullYear()}-${datosTramite.codigo_tramite}` : '';
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // Ruta donde se validará el documento
  const urlVerificacion = `${baseUrl}/verificar/${codigoSeguridad}`;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
        <p className="text-gray-500 font-medium">Preparando documento final...</p>
      </div>
    );
  }

  if (!datosTramite) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
        <h2 className="text-xl font-bold text-gray-700">Trámite no encontrado</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen">

      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
        <button 
          onClick={() => router.push(`/tramites/revisar/${tramiteId}`)}
          className="text-gray-500 hover:text-[#8B1A1A] transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="font-bold text-gray-800">Volver a Revisión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CERTIFICADO A4 */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center bg-gray-800 text-gray-300 text-xs font-mono py-2 px-4 rounded-t-xl">
            <span>VISTA PREVIA DE IMPRESIÓN - PÁGINA PRINCIPAL</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">print</span></span>
          </div>

          <div id="certificado-pantalla" className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col border border-gray-200">
            <div className="bg-[#8B1A1A] text-white pt-8 pb-6 px-10">
              <h1 className="text-2xl font-bold tracking-wide mb-1">UNIVERSIDAD PRIVADA DEL VALLE — UNIVALLE</h1>
              <p className="text-sm opacity-90 mb-3">Sistema de Gestión de Trámites Académicos</p>
              <h2 className="text-xl font-black tracking-wide">CONSTANCIA DE TRÁMITE — DOCUMENTO FINAL</h2>
            </div>

            <div className="flex flex-col flex-1 px-10 py-8">
              <div className="flex justify-between text-sm text-gray-800 mb-8 font-medium">
                <span>N° solicitud: #{datosTramite.id_tramite}</span>
                <span>Fecha de emisión: {fechaHoy}</span>
              </div>

              <div className="text-sm text-gray-800 mb-8 space-y-1.5">
                <p className="font-bold text-base mb-2">Estudiante</p>
                <p><span className="font-medium">Nombre:</span> {datosTramite.nombre_completo}</p>
                <p><span className="font-medium">Correo institucional:</span> {datosTramite.correo}</p>
                <p><span className="font-medium">Carrera:</span> {datosTramite.carrera || 'No especificada'}</p>
                <p><span className="font-medium">Registrado por Unidad de Trámites:</span> UNIVALLE</p>
              </div>

              <div className="mb-8">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-[#8B1A1A] text-white">
                      <th className="py-2.5 px-4 font-bold w-12 border border-[#8B1A1A]">#</th>
                      <th className="py-2.5 px-4 font-bold border border-[#8B1A1A]">Trámite / procedimiento</th>
                      <th className="py-2.5 px-4 font-bold text-right border border-[#8B1A1A]">Referencia costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td className="py-3 px-4 border-x border-gray-200 text-gray-600">1</td>
                      <td className="py-3 px-4 border-x border-gray-200 font-medium text-gray-800">{datosTramite.tipo_tramite}</td>
                      {/* --- AQUÍ REEMPLAZAMOS EL COSTO --- */}
                      <td className="py-3 px-4 border-x border-gray-200 text-right text-gray-600">
                        Bs. {datosTramite.monto !== undefined && datosTramite.monto !== null ? datosTramite.monto : '---'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-12">
                <p className="text-sm font-bold text-gray-900 mb-1">Observaciones:</p>
                <p className="text-xs text-gray-700 mb-4">Constancia final con registro de firmas de responsables institucionales (control documental).</p>
                <p className="text-[11px] text-gray-500 leading-relaxed text-justify pr-10">
                  Este documento consolida el registro de firmas correspondientes al flujo académico-administrativo ({datosTramite.tipo_tramite.toLowerCase()}). Las imágenes adjuntas corresponden a las rúbricas institucionales cargadas por Trámites. Los respaldos documentales continúan en las páginas adjuntas a esta certificación.
                </p>
              </div>

              {firmasActuales.length > 0 && (
                <div className="flex justify-center items-end gap-16 mt-auto mb-16 pt-8">
                  {firmasActuales.map((firma) => (
                    <div key={firma.id_usuario} className="flex flex-col items-center">
                      <img src={firma.firma_digital_url} alt="Firma" className="h-20 object-contain mix-blend-multiply" crossOrigin="anonymous" />
                      <div className="border-t border-gray-400 w-48 mt-2 text-center text-[11px] text-gray-800 pt-1 font-bold uppercase leading-tight">
                        {firma.nombre_completo}
                        <span className="block font-normal text-gray-500 mt-0.5">{obtenerNombreRol(firma.id_rol)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECCIÓN DEL QR DINÁMICO */}
              <div className="mt-auto flex items-start gap-4">
                <div className="flex flex-col">
                  <div className="w-24 h-24 bg-white border border-gray-300 p-1 flex items-center justify-center">
                    <QRCodeSVG value={urlVerificacion} size={86} level={"H"} />
                  </div>
                  <span className="text-[9px] font-bold mt-1 text-gray-800">Cód.: {codigoSeguridad}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] text-gray-500 max-w-[250px] leading-relaxed">
                    Puede comprobar la autenticidad de esta constancia escaneando el código QR impreso.
                  </p>
                  <p className="text-[10px] text-gray-800 font-bold mt-2">
                    Enlace directo: <span className="font-normal">{urlVerificacion}</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* PANELES DE CONTROL */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Resumen de Emisión
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Solicitante</p>
                <p className="font-bold text-gray-800">{datosTramite.nombre_completo}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Firmas Incluidas</p>
                  <p className="font-bold text-gray-800">{firmasActuales.length} Autoridad(es)</p>
                </div>
                <span className="material-symbols-outlined text-[#8B1A1A] text-3xl opacity-20">history_edu</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                Adjuntar Respaldos
              </h3>
              {archivosRespaldo.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">
                  {archivosRespaldo.length} {archivosRespaldo.length === 1 ? 'archivo' : 'archivos'}
                </span>
              )}
            </div>

            <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
              archivosRespaldo.length > 0 ? 'border-gray-200 hover:border-[#8B1A1A] hover:bg-red-50/30 mb-4' : 'border-gray-300 hover:border-[#8B1A1A] hover:bg-red-50/30'
            }`}>
              <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
              <div className="flex flex-col items-center text-gray-400 group-hover:text-[#8B1A1A]">
                <div className="w-12 h-12 bg-gray-50 group-hover:bg-red-50 rounded-full flex items-center justify-center mb-3 transition-colors">
                  <span className="material-symbols-outlined text-2xl transition-transform group-hover:-translate-y-1">cloud_upload</span>
                </div>
                <p className="font-bold text-gray-700 text-sm">Seleccionar PDFs</p>
                <p className="text-[10px] uppercase tracking-wider mt-1 font-medium text-gray-400">Las hojas se adjuntarán debajo</p>
              </div>
            </label>

            {archivosRespaldo.length > 0 && (
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                {archivosRespaldo.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="material-symbols-outlined text-green-600 text-lg shrink-0">check_circle</span>
                      <p className="text-xs font-bold text-gray-700 truncate" title={file.name}>{file.name}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); eliminarArchivo(index); }}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0"
                      title="Quitar archivo"
                    >
                      <span className="material-symbols-outlined text-[16px] block">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={handleFinalizar}
              disabled={isSubmitting || isPrinting}
              className={`w-full bg-[#8B1A1A] hover:bg-[#6b1414] text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-1'}`}
            >
              <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : 'send_and_archive'}
              </span>
              {isSubmitting ? 'Generando...' : 'Finalizar y Emitir'}
            </button>
            
            <button 
              onClick={handleImprimir}
              disabled={isSubmitting || isPrinting}
              className={`w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 ${(isSubmitting || isPrinting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`material-symbols-outlined ${isPrinting ? 'animate-spin' : ''}`}>
                {isPrinting ? 'sync' : 'print'}
              </span>
              {isPrinting ? 'Preparando...' : 'Imprimir Copia'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}