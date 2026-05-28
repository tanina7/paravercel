'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface FirmaData {
  id_usuario: number;
  nombre_completo: string;
  firma_digital_url: string;
}

// MAGIA ANTI-NEXT.JS: Carga las librerías desde internet solo cuando se necesitan
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function DetalleTramitePage() {
  const params = useParams();
  const router = useRouter();
  const idTramite = params?.id;

  const [tramite, setTramite] = useState<any>(null);
  const [firmasDB, setFirmasDB] = useState<FirmaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!idTramite) return;

    const cargarTramite = fetch(`/api/tramites/detalle/${idTramite}`).then(res => res.json());
    const cargarFirmas = fetch('/api/obtener-firmas').then(res => res.json());

    Promise.all([cargarTramite, cargarFirmas])
      .then(([dataTramite, dataFirmas]) => {
        if (dataTramite.success) {
          setTramite(dataTramite.data);
        } else {
          console.error("Error en API Detalle:", dataTramite.error);
        }
        if (dataFirmas.success) {
          setFirmasDB(dataFirmas.firmas);
        }
      })
      .catch((err) => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));
  }, [idTramite]);

  const handleImprimir = () => {
    window.print();
  };

  const handleDescargarPDF = async () => {
    const elemento = document.getElementById('certificado-pdf');
    if (!elemento) return;

    setIsDownloading(true);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const domtoimage = (window as any).domtoimage;
      const jsPDF = (window as any).jspdf.jsPDF;

      const imgData = await domtoimage.toPng(elemento, { 
        bgcolor: '#ffffff',
        style: {
          transform: 'scale(1)', 
          transformOrigin: 'top left'
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight); 
      pdf.save(`Certificado_${tramite?.codigo_tramite || 'Finalizado'}.pdf`);

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error generando el PDF. Revisa la consola.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl animate-spin text-[#8B1A1A]">sync</span>
        <p className="text-gray-500 font-medium">Cargando documento finalizado...</p>
      </div>
    );
  }

  if (!tramite) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
        <h2 className="text-xl font-bold text-gray-700">Trámite no encontrado</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#8B1A1A] hover:underline">
          Volver al historial
        </button>
      </div>
    );
  }

  let firmasUsadas = firmasDB.filter(f => {
    if (!tramite.firma_digital_url) return false;
    const guardadoStr = String(tramite.firma_digital_url);
    return guardadoStr.includes(String(f.id_usuario)) || guardadoStr.includes(f.firma_digital_url);
  });

  if (firmasUsadas.length === 0 && firmasDB.length > 0) {
    firmasUsadas = [firmasDB[0]]; 
  }

  const nombresFirmantes = firmasUsadas.length > 0 
    ? firmasUsadas.map(f => f.nombre_completo).join(', ') 
    : "Documento oficial archivado";

  const codigoSeguridad = `J5SH5CF${tramite.id_tramite || '94'}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white !important; }
          body * { visibility: hidden !important; }
          .certificado-oficial, .certificado-oficial * { visibility: visible !important; }
          .certificado-oficial {
            position: absolute !important; left: 0 !important; top: 0 !important; width: 100vw !important;
            margin: 0 !important; padding: 15mm 20mm !important; transform: scale(0.95) !important;
            transform-origin: top center !important; box-sizing: border-box !important; border: none !important; box-shadow: none !important;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen">
        
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-[#8B1A1A] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="font-bold text-gray-800 text-lg">Volver al Historial</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          
          <div id="certificado-pdf" className="certificado-oficial bg-white w-full max-w-3xl rounded-xl shadow-sm border border-gray-100 p-10">
            
            <div className="text-center mb-6">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block print:hidden" data-html2canvas-ignore="true">
                Trámite Finalizado
              </span>
              <p className="text-xs text-gray-500 mb-2">Resolución Ministerial N° 0068/2023 de 15 de marzo de 2023</p>
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest border-b border-gray-800 pb-2 inline-block">
                {tramite.tipo_tramite || 'Documento Oficial'}
              </h1>
            </div>

            <div className="border border-gray-200 p-3 rounded-md mb-6 bg-gray-50/50">
              <p className="text-sm text-gray-600 text-center">
                El Ministerio de Educación del Estado Plurinacional de Bolivia, a través de la Dirección General de Educación Superior Universitaria, certifica a favor de:
              </p>
            </div>

            <div className="bg-[#eaf4ff] py-3 px-4 rounded-md mb-6 text-center border border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                {tramite.nombre_completo || 'Usuario Desconocido'}
              </h2>
            </div>

            <div className="mb-6">
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold text-gray-700 w-2/5 text-center bg-gray-50">Detalle del documento:</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700">{tramite.tipo_tramite || 'Trámite Universitario'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-center bg-gray-50">Firmado por:</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700 font-medium">{nombresFirmantes}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-center bg-gray-50">Fecha de Cierre:</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700">
                      {tramite.fecha_cierre 
                        ? new Date(tramite.fecha_cierre).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) 
                        : 'Fecha no registrada'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-center bg-gray-50">Responsable:</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700">UNIVALLE</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-center bg-gray-50">N° de certificado:</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700 font-mono">{tramite.codigo_tramite}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-center bg-gray-50">Código de seguridad:</td>
                    <td className="border border-gray-200 p-3 text-center text-gray-700 font-mono bg-gray-50">{codigoSeguridad}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {firmasUsadas.length > 0 ? (
              <div className="flex justify-center items-end gap-12 mt-6 mb-4">
                {firmasUsadas.map((firma) => (
                  <div key={firma.id_usuario} className="flex flex-col items-center">
                    {/* AQUÍ ESTÁ EL ESCUDO: Si da error 404, se vuelve un pixel transparente invisible */}
                    <img 
                      src={firma.firma_digital_url} 
                      alt={`Firma`} 
                      className="h-14 object-contain mix-blend-multiply" 
                      crossOrigin="anonymous" 
                      onError={(e) => {
                        e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                      }}
                    />
                    <div className="border-t border-gray-800 w-48 mt-1 text-center text-[9px] text-gray-600 pt-1 font-bold uppercase leading-tight">
                      {firma.nombre_completo}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="border-t border-gray-400 w-48 mt-10 text-center text-[9px] text-gray-400 pt-1 font-bold uppercase mx-auto">
                 SIN FIRMA REGISTRADA
               </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <p className="text-[10px] text-gray-500 max-w-[65%] text-justify leading-relaxed">
                Se certifica que {firmasUsadas.length > 1 ? "las firmas que anteceden corresponden a los funcionarios autorizados" : "la firma que antecede corresponde al funcionario autorizado"} y que el presente documento tiene plena validez legal conforme a la normativa vigente.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <span className="material-symbols-outlined text-3xl mb-1">qr_code_2</span>
                <span className="text-[7px] text-center leading-tight">Escanee para verificar</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl mt-6 justify-center">
            <button 
              onClick={handleImprimir}
              className="bg-[#334155] hover:bg-[#1e293b] text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-1"
            >
              <span className="material-symbols-outlined text-xl">print</span>
              Imprimir
            </button>

            <button 
              onClick={handleDescargarPDF}
              disabled={isDownloading}
              className={`bg-[#8B1A1A] hover:bg-[#6c1414] text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-1 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`material-symbols-outlined text-xl ${isDownloading ? 'animate-bounce' : ''}`}>
                download
              </span>
              {isDownloading ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}