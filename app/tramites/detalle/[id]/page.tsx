'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

interface FirmaData {
  id_usuario: number;
  id_rol?: number;
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
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (!idTramite) return;
    setBaseUrl(window.location.origin);

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
    const elemento = document.getElementById('certificado-pantalla');
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

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); 
      pdf.save(`Certificado_${tramite?.codigo_tramite || 'Finalizado'}.pdf`);

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error generando el PDF. Revisa la consola.");
    } finally {
      setIsDownloading(false);
    }
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

  // Filtrado de firmas
  let firmasUsadas = firmasDB.filter(f => {
    if (!tramite.firma_digital_url) return false;
    const guardadoStr = String(tramite.firma_digital_url);
    return guardadoStr.includes(String(f.id_usuario)) || guardadoStr.includes(f.firma_digital_url);
  });

  if (firmasUsadas.length === 0 && firmasDB.length > 0) {
    firmasUsadas = [firmasDB[0]]; 
  }

  // Variables para el certificado
  const codigoSeguridad = `UV-${new Date(tramite.fecha_creacion || tramite.fecha_cierre || Date.now()).getFullYear()}-${tramite.codigo_tramite}`;
  const urlVerificacion = `${baseUrl}/verificar/${codigoSeguridad}`;
  const fechaHoy = new Date(tramite.fecha_cierre || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white !important; }
          body * { visibility: hidden !important; }
          #certificado-pantalla, #certificado-pantalla * { visibility: visible !important; }
          #certificado-pantalla {
            position: absolute !important; left: 0 !important; top: 0 !important;
            margin: 0 !important; padding: 0 !important; 
            border: none !important; box-shadow: none !important;
            width: 100% !important;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen">
        
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-[#8B1A1A] transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="font-bold text-gray-800">Volver al Historial</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          
          <div className="w-full max-w-[210mm] flex justify-between items-center bg-gray-800 text-gray-300 text-xs font-mono py-2 px-4 rounded-t-xl print:hidden">
            <span>COPIA DIGITAL ARCHIVADA</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">archive</span></span>
          </div>

          {/* EL DISEÑO A4 EXACTO DEL CERTIFICADO FINAL */}
          <div id="certificado-pantalla" className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col border border-gray-200">
            <div className="bg-[#8B1A1A] text-white pt-8 pb-6 px-10">
              <h1 className="text-2xl font-bold tracking-wide mb-1">UNIVERSIDAD PRIVADA DEL VALLE — UNIVALLE</h1>
              <p className="text-sm opacity-90 mb-3">Sistema de Gestión de Trámites Académicos</p>
              <h2 className="text-xl font-black tracking-wide">CONSTANCIA DE TRÁMITE — DOCUMENTO FINAL</h2>
            </div>

            <div className="flex flex-col flex-1 px-10 py-8">
              <div className="flex justify-between text-sm text-gray-800 mb-8 font-medium">
                <span>N° solicitud: #{tramite.id_tramite}</span>
                <span>Fecha de emisión: {fechaHoy}</span>
              </div>

              <div className="text-sm text-gray-800 mb-8 space-y-1.5">
                <p className="font-bold text-base mb-2">Estudiante</p>
                <p><span className="font-medium">Nombre:</span> {tramite.nombre_completo}</p>
                <p><span className="font-medium">Correo institucional:</span> {tramite.correo || 'No registrado'}</p>
                <p><span className="font-medium">Carrera:</span> {tramite.carrera || 'No especificada'}</p>
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
                      <td className="py-3 px-4 border-x border-gray-200 font-medium text-gray-800">{tramite.tipo_tramite}</td>
                      <td className="py-3 px-4 border-x border-gray-200 text-right text-gray-600">
                        Bs. {tramite.monto !== undefined && tramite.monto !== null ? tramite.monto : '---'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-12">
                <p className="text-sm font-bold text-gray-900 mb-1">Observaciones:</p>
                <p className="text-xs text-gray-700 mb-4">Constancia final con registro de firmas de responsables institucionales (control documental).</p>
                <p className="text-[11px] text-gray-500 leading-relaxed text-justify pr-10">
                  Este documento consolida el registro de firmas correspondientes al flujo académico-administrativo ({String(tramite.tipo_tramite || '').toLowerCase()}). Las imágenes adjuntas corresponden a las rúbricas institucionales cargadas por Trámites. Los respaldos documentales continúan en las páginas adjuntas a esta certificación.
                </p>
              </div>

              {firmasUsadas.length > 0 && (
                <div className="flex justify-center items-end gap-16 mt-auto mb-16 pt-8">
                  {firmasUsadas.map((firma) => (
                    <div key={firma.id_usuario} className="flex flex-col items-center">
                      <img 
                        src={firma.firma_digital_url} 
                        alt="Firma" 
                        className="h-20 object-contain mix-blend-multiply" 
                        crossOrigin="anonymous" 
                        onError={(e) => {
                          e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                        }}
                      />
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

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[210mm] mt-6 justify-center">
            <button 
              onClick={handleImprimir}
              className="bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-8 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 flex-1 uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-xl">print</span>
              Imprimir Copia
            </button>

            <button 
              onClick={handleDescargarPDF}
              disabled={isDownloading}
              className={`bg-[#8B1A1A] hover:bg-[#6c1414] text-white font-black py-3.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-1 uppercase tracking-wider ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`material-symbols-outlined text-xl ${isDownloading ? 'animate-bounce' : ''}`}>
                download
              </span>
              {isDownloading ? 'Generando PDF...' : 'Descargar Original'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}