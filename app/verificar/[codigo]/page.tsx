'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

// --- Función para cargar librerías de PDF ---
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

export default function VerificarDocumentoPage() {
  const params = useParams();
  const router = useRouter();
  const [codigo, setCodigo] = useState<string>('');
  const [tramite, setTramite] = useState<any>(null);
  const [firmasDB, setFirmasDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    async function fetchParamsAndData() {
      try {
        const resolvedParams = await Promise.resolve(params);
        const codigoEscaneado = resolvedParams?.codigo as string;
        
        if (!codigoEscaneado) {
          setError("Código no proporcionado.");
          setLoading(false);
          return;
        }
        
        setCodigo(codigoEscaneado);

        const [resTramite, resFirmas] = await Promise.all([
          fetch(`/api/verificar/${encodeURIComponent(codigoEscaneado)}`),
          fetch('/api/obtener-firmas')
        ]);

        const dataTramite = await resTramite.json();
        const dataFirmas = await resFirmas.json();

        if (dataTramite.success) {
          setTramite(dataTramite.data);
        } else {
          setError(dataTramite.message || "Documento no encontrado o inválido.");
        }

        if (dataFirmas.success) {
          setFirmasDB(dataFirmas.firmas);
        }
      } catch (err) {
        console.error("Error cargando verificación:", err);
        setError("Error de conexión al verificar el documento.");
      } finally {
        setLoading(false);
      }
    }

    fetchParamsAndData();
  }, [params]);

  const handleDescargarPDF = async () => {
    const elemento = document.getElementById('certificado-a4');
    if (!elemento) return;
    setIsDownloading(true);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const domtoimage = (window as any).domtoimage;
      const jsPDF = (window as any).jspdf.jsPDF;

      const imgData = await domtoimage.toPng(elemento, { 
        bgcolor: '#ffffff',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); 
      pdf.save(`Certificado_${codigo}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error generando el PDF.");
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
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
        <h2 className="text-xl font-bold">Verificando Autenticidad...</h2>
        <p className="text-gray-400">Conectando con bases de datos UNIVALLE</p>
      </div>
    );
  }

  if (error || !tramite) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-12 max-w-lg w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificación Fallida</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button onClick={() => router.push('/usuario/landing')} className="w-full bg-[#8B1A1A] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#6b1414] transition-colors">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  let firmasUsadas = [];
  if (tramite && firmasDB.length > 0) {
    firmasUsadas = firmasDB.filter(f => {
      if (!tramite.firma_digital_url) return false;
      const guardadoStr = String(tramite.firma_digital_url);
      return guardadoStr.includes(String(f.id_usuario)) || guardadoStr.includes(f.firma_digital_url);
    });
    if (firmasUsadas.length === 0) firmasUsadas = [firmasDB[0]]; 
  }

  return (
    <div className="min-h-screen bg-[#1a1c23] py-12 px-4 flex flex-col items-center overflow-x-hidden font-sans">
      
      <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full flex items-center gap-3 mb-8 shadow-lg backdrop-blur-sm">
        <span className="text-2xl">✅</span>
        <span className="text-green-400 font-bold uppercase tracking-widest text-sm">Documento Oficial Auténtico</span>
      </div>

      <div 
        id="certificado-a4" 
        className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col mx-auto overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#8B1A1A] text-white pt-10 pb-8 px-12">
          <h1 className="text-2xl font-bold tracking-wide mb-1">UNIVERSIDAD PRIVADA DEL VALLE — UNIVALLE</h1>
          <p className="text-sm opacity-90 mb-4">Sistema de Gestión de Trámites Académicos</p>
          <h2 className="text-xl font-black tracking-wide">CONSTANCIA DE TRÁMITE — DOCUMENTO FINAL</h2>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-12 py-10">
          <div className="flex justify-between text-sm text-gray-800 mb-10 font-medium">
            <span>N° solicitud: #{tramite.id_tramite}</span>
            <span>Fecha de emisión: {new Date(tramite.fecha_creacion || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="text-sm text-gray-800 mb-10 space-y-2">
            <p className="font-bold text-base mb-3">Estudiante</p>
            <p><span className="font-medium">Nombre:</span> {tramite.nombre_completo}</p>
            <p><span className="font-medium">Correo institucional:</span> {tramite.correo || 'No registrado'}</p>
            <p><span className="font-medium">Carrera:</span> {tramite.carrera || 'No especificada'}</p>
            <p><span className="font-medium">Registrado por Unidad de Trámites:</span> UNIVALLE</p>
          </div>

          <div className="mb-10">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#8B1A1A] text-white">
                  <th className="py-3 px-4 font-bold w-12 border border-[#8B1A1A]">#</th>
                  <th className="py-3 px-4 font-bold border border-[#8B1A1A]">Trámite / procedimiento</th>
                  <th className="py-3 px-4 font-bold text-right border border-[#8B1A1A]">Referencia costo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="py-4 px-4 border-x border-gray-200 text-gray-600">1</td>
                  <td className="py-4 px-4 border-x border-gray-200 font-medium text-gray-800">{tramite.tipo_tramite}</td>
                  <td className="py-4 px-4 border-x border-gray-200 text-right text-gray-600">
                    Bs. {tramite.monto !== undefined && tramite.monto !== null ? tramite.monto : '---'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-12">
            <p className="text-sm font-bold text-gray-900 mb-2">Observaciones:</p>
            <p className="text-xs text-gray-700 mb-3">Constancia final con registro de firmas de responsables institucionales (control documental).</p>
            <p className="text-[11px] text-gray-500 leading-relaxed text-justify pr-10">
              Este documento consolida el registro de firmas correspondientes al flujo académico-administrativo ({String(tramite.tipo_tramite || '').toLowerCase()}). Las imágenes adjuntas corresponden a las rúbricas institucionales cargadas por Trámites.
            </p>
          </div>

          {/* Firmas centradas y compactas */}
          {firmasUsadas.length > 0 && (
            <div className="flex justify-center items-end gap-12 mt-auto mb-10 pt-4">
              {firmasUsadas.map((firma) => (
                <div key={firma.id_usuario} className="flex flex-col items-center">
                  <img src={firma.firma_digital_url} alt="Firma" className="h-20 object-contain mix-blend-multiply" crossOrigin="anonymous" 
                    onError={(e) => { e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; }}
                  />
                  <div className="border-t border-gray-400 w-48 mt-2 text-center text-[11px] text-gray-800 pt-1.5 font-bold uppercase leading-tight">
                    {firma.nombre_completo}
                    <span className="block font-normal text-gray-500 mt-0.5 text-[10px]">{obtenerNombreRol(firma.id_rol)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🔥 QR Ajustado para no salirse de los bordes 🔥 */}
          <div className="mt-auto flex items-start gap-5 pt-4 pb-4">
            <div className="flex flex-col flex-shrink-0">
              <div className="w-[100px] h-[100px] bg-white border border-gray-300 p-1.5 flex items-center justify-center">
                <QRCodeSVG value={`${baseUrl}/verificar/${codigo}`} size={85} level={"H"} />
              </div>
              <span className="text-[9px] font-bold mt-1.5 text-gray-800 text-center">Cód.: {codigo.split('-').slice(-1)}</span>
            </div>
            <div className="pt-1 flex flex-col justify-center min-w-0">
              <p className="text-[11px] text-gray-600 leading-snug mb-1">
                Puede comprobar la autenticidad de esta constancia escaneando el código QR impreso.
              </p>
              <p className="text-[9px] text-gray-400 font-mono truncate">
                Enlace directo: {baseUrl}/verificar/{codigo}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Adjuntos */}
      {tramite.archivos && tramite.archivos.filter((d:any) => !String(d.tipo_archivo || d.tipo_documento).includes('Certificado PDF Oficial')).length > 0 && (
        <div className="w-full max-w-[210mm] mt-8 bg-white rounded-xl p-8 shadow-xl text-left">
          <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <span className="text-3xl flex-shrink-0">📁</span> 
            <span>Expediente Digital Adjunto</span>
          </h3>
          <p className="text-sm text-gray-500 mb-6">Documentación adicional vinculada a este trámite oficial.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tramite.archivos
              .filter((d:any) => !String(d.tipo_archivo || d.tipo_documento).includes('Certificado PDF Oficial'))
              .map((doc: any, i: number) => {
                const linkArchivo = doc.archivo || doc.ruta_archivo || '#';
                const nombreArchivo = doc.tipo_archivo || doc.tipo_documento || `Documento Adjunto ${i + 1}`;
                const isPdf = String(linkArchivo).toLowerCase().endsWith('.pdf');
                
                return (
                  <a 
                    key={i} href={linkArchivo} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 min-w-[48px] bg-white rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-red-300 shadow-sm overflow-hidden">
                      <span className="text-2xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {isPdf ? '📄' : '⭐'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-sm text-gray-800 group-hover:text-[#8B1A1A] truncate leading-tight mb-1" title={nombreArchivo}>
                        {nombreArchivo}
                      </p>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold truncate flex items-center gap-1.5 group-hover:text-red-500">
                        <span className="text-[14px]">🔍</span>
                        Ver documento
                      </p>
                    </div>
                  </a>
                )
              })}
          </div>
        </div>
      )}

      {/* Botones de acción inferiores */}
      <div className="w-full max-w-[210mm] mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => window.print()} 
          className="bg-white text-gray-900 border border-gray-200 font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
        >
          <span className="text-xl">🖨️</span> Imprimir
        </button>
        <button 
          onClick={handleDescargarPDF} 
          disabled={isDownloading}
          className={`bg-[#8B1A1A] text-white font-black py-4 px-6 rounded-xl shadow-lg hover:bg-[#6b1414] transition-colors flex items-center justify-center gap-3 uppercase tracking-wider text-sm ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={`text-xl ${isDownloading ? 'animate-bounce' : ''}`}>📥</span> 
          {isDownloading ? 'Generando...' : 'Descargar Oficial'}
        </button>
        <button 
          onClick={() => router.push('/usuario/landing')} 
          className="bg-gray-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
        >
          <span className="text-xl">🏠</span> Inicio
        </button>
      </div>
    </div>
  );
}