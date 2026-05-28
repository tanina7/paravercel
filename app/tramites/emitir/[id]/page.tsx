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
  // Ahora capturamos 'firmasIds' (plural) que viene como "1,3,5"
  const firmasIdsURL = searchParams.get('firmasIds') || '';

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
    setTimeout(() => {
      window.print();
    }, 100);
  };
  const sanitizeStyles = () => {
    // Esta función ya no se usa, pero la dejamos por compatibilidad
    return () => {};
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
      // 1. Cargar librerías necesarias desde CDN
      const html2canvas = await new Promise<any>((resolve, reject) => {
        if ((window as any).html2canvas) {
          resolve((window as any).html2canvas);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => resolve((window as any).html2canvas);
        script.onerror = () => reject(new Error('No se pudo cargar html2canvas'));
        document.body.appendChild(script);
      });

      const jsPDF = await new Promise<any>((resolve, reject) => {
        if ((window as any).jspdf && (window as any).jspdf.jsPDF) {
          resolve((window as any).jspdf.jsPDF);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve((window as any).jspdf.jsPDF);
        script.onerror = () => reject(new Error('No se pudo cargar jsPDF'));
        document.body.appendChild(script);
      });

      // 2. Obtener el elemento original
      const originalElement = document.getElementById('certificado-pantalla');
      if (!originalElement) {
        throw new Error('No se encontró el contenedor del certificado.');
      }

      // 3. CREAR UN CLON LIMPIO SIN CLASES DE TAILWIND
      const cleanElement = originalElement.cloneNode(true) as HTMLElement;
      
      // Limpiar todas las clases de Tailwind y aplicar estilos básicos inline
      const cleanupElement = (el: Element) => {
        // Remover todas las clases
        el.className = '';
        
        // Aplicar estilos básicos inline para estructura
        if (el instanceof HTMLElement) {
          el.style.fontFamily = 'Arial, sans-serif';
          el.style.color = '#000';
          el.style.backgroundColor = '#fff';
          el.style.margin = '0';
          el.style.padding = el.tagName === 'TABLE' ? '0' : el.style.padding;
        }
        
        // Procesar todos los hijos recursivamente
        for (let i = 0; i < el.children.length; i++) {
          cleanupElement(el.children[i]);
        }
      };

      // Limpiar el clon
      cleanupElement(cleanElement);

      // 4. Crear un contenedor temporal invisible
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.backgroundColor = '#fff';
      tempContainer.style.padding = '10mm';
      tempContainer.appendChild(cleanElement);
      document.body.appendChild(tempContainer);

      try {
        // 5. Capturar el clon limpio como imagen
        const canvas = await html2canvas(cleanElement, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowHeight: cleanElement.scrollHeight,
          windowWidth: 900,
          letterRendering: true
        });

        // 6. Convertir canvas a imagen
        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        // 7. Crear PDF usando jsPDF
        const pageWidth = 210; // mm (A4)
        const pageHeight = 297; // mm (A4)
        
        // Calcular altura proporcional
        const imgWidth = pageWidth - 10;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        let heightLeft = imgHeight;
        let position = 5;

        pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // 8. Convertir PDF a Blob
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], `certificado_${tramiteId}.pdf`, { type: 'application/pdf' });

        // 9. Preparar FormData para el backend
        const formData = new FormData();
        formData.append('tramiteId', tramiteId as string);
        formData.append('firmasIds', firmasIdsURL);
        formData.append('usuarioOperadorId', '4');
        formData.append('archivo', pdfFile);

        if (archivoPDF) {
          formData.append('respaldo', archivoPDF);
        }

        // 10. Enviar al servidor
        const response = await fetch('/api/tramites/finalizar', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          await Swal.fire({
            title: '¡Emitido!',
            text: 'El certificado ha sido generado y guardado exitosamente.',
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
      } finally {
        // Limpiar el elemento temporal
        if (tempContainer.parentNode) {
          tempContainer.parentNode.removeChild(tempContainer);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire({
        title: 'Error al generar el certificado',
        text: error.message || 'No se pudo generar o enviar el archivo del certificado.',
        icon: 'error',
        confirmButtonColor: '#8B1A1A'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PROCESAMIENTO DE FIRMAS MÚLTIPLES ---
  // Convertimos el string "1,3" en un arreglo de IDs, y filtramos las firmas correspondientes
  const arrayIds = firmasIdsURL.split(',').filter(id => id.trim() !== '');
  const firmasActuales = firmas.filter(f => arrayIds.includes(f.id_usuario.toString()));
  
  // Creamos un string con los nombres de todas las autoridades ("Juan Perez, Maria Lopez")
  const nombresFirmantes = firmasActuales.length > 0 
    ? firmasActuales.map(f => f.nombre_completo).join(', ') 
    : "Pendiente de asignación";

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
          <div id="certificado-pantalla" className="bg-white w-full max-w-3xl rounded-xl shadow-sm border border-gray-100 p-10 relative print:border-none print:shadow-none print:p-4">
            
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 mb-4 font-medium">Resolución Ministerial N° 0068/2023 de 15 de marzo de 2023</p>
              <h1 className="text-3xl font-black text-gray-800 uppercase tracking-widest border-b-2 border-gray-800 pb-3 inline-block">
                {datosTramite.tipo_tramite}
              </h1>
            </div>

            <div className="border border-gray-300 p-4 rounded-md mb-6 bg-gray-50/50 print:bg-transparent">
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                El Ministerio de Educación del Estado Plurinacional de Bolivia, a través de la Dirección General de Educación Superior Universitaria, certifica a favor de:
              </p>
            </div>

            <div className="bg-[#eaf4ff] py-5 px-4 rounded-md mb-8 text-center border-2 border-blue-200 print:bg-gray-100 print:border-gray-400">
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                {datosTramite.nombre_completo}
              </h2>
            </div>

            {/* Tabla de Detalles */}
            <div className="mb-8">
              <table className="w-full text-base text-left border-collapse border-2 border-gray-400">
                <tbody>
                  <tr>
                    <td className="border-2 border-gray-400 p-3 font-bold text-gray-800 w-2/5 text-center bg-gray-200">Detalle del documento:</td>
                    <td className="border-2 border-gray-400 p-3 text-center text-gray-800 font-medium">{datosTramite.tipo_tramite}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-400 p-3 font-bold text-gray-800 text-center bg-gray-200">Firmado por:</td>
                    <td className="border-2 border-gray-400 p-3 text-center text-gray-800 font-medium">
                      {/* Aquí se muestran todos los nombres concatenados */}
                      {nombresFirmantes}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-400 p-3 font-bold text-gray-800 text-center bg-gray-200">Fecha:</td>
                    <td className="border-2 border-gray-400 p-3 text-center text-gray-800 font-medium">
                      {new Date(datosTramite.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-400 p-3 font-bold text-gray-800 text-center bg-gray-200">Responsable:</td>
                    <td className="border-2 border-gray-400 p-3 text-center text-gray-800 font-medium">UNIVALLE</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-400 p-3 font-bold text-gray-800 text-center bg-gray-200">N° de certificado:</td>
                    <td className="border-2 border-gray-400 p-3 text-center text-gray-800 font-medium">{datosTramite.codigo_tramite}</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-gray-400 p-3 font-bold text-gray-800 text-center bg-gray-200">Código de seguridad:</td>
                    <td className="border-2 border-gray-400 p-3 text-center text-gray-800 font-mono bg-gray-100 font-bold">{codigoSeguridad}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RENDERIZADO VISUAL DE LAS FIRMAS */}
            {firmasActuales.length > 0 && (
              <div className="flex justify-center items-end gap-10 mt-12 mb-6">
                {firmasActuales.map((firma) => (
                  <div key={firma.id_usuario} className="flex flex-col items-center">
                    <img src={firma.firma_digital_url} alt="Firma" className="h-12 object-contain mix-blend-multiply" />
                    <div className="border-t-2 border-gray-900 w-44 mt-2 text-center text-sm text-gray-700 pt-2 font-bold uppercase leading-tight">
                      {firma.nombre_completo}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer del certificado (Texto + QR) */}
            <div className="flex justify-between items-center mt-8 gap-4">
              <p className="text-sm text-gray-700 max-w-[65%] text-justify leading-relaxed font-medium">
                Se certifica que {firmasActuales.length > 1 ? "las firmas que anteceden corresponden a los funcionarios autorizados" : "la firma que antecede corresponde al funcionario autorizado"} y que el presente documento tiene plena validez legal conforme a la normativa vigente.
              </p>
              <div className="border-2 border-solid border-gray-500 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center text-gray-600 bg-white print:bg-white print:border-solid print:border-gray-600">
                <span className="material-symbols-outlined text-3xl mb-0.5">qr_code_2</span>
                <span className="text-xs text-center leading-tight font-semibold">Verificar</span>
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