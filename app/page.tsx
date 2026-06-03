'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function PortalPublicoPage() {
  const router = useRouter();
  
  const [baseUrl, setBaseUrl] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [estadoBusqueda, setEstadoBusqueda] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensajeError, setMensajeError] = useState('');
  
  const [tramite, setTramite] = useState<any>(null);
  const [firmasDB, setFirmasDB] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;

    setEstadoBusqueda('loading');
    setTramite(null);
    setMensajeError('');

    try {
      const [resTramite, resFirmas] = await Promise.all([
        fetch(`/api/verificar/${encodeURIComponent(codigoBusqueda.trim())}`),
        fetch('/api/obtener-firmas')
      ]);

      const dataTramite = await resTramite.json();
      const dataFirmas = await resFirmas.json();

      if (dataTramite.success) {
        setTramite(dataTramite.data);
        if (dataFirmas.success) {
          setFirmasDB(dataFirmas.firmas);
        }
        setEstadoBusqueda('success');
      } else {
        setMensajeError(dataTramite.message || 'No se encontró ningún trámite con ese código.');
        setEstadoBusqueda('error');
      }
    } catch (error) {
      setMensajeError('Error de conexión con el servidor. Intenta nuevamente.');
      setEstadoBusqueda('error');
    }
  };

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
      pdf.save(`Certificado_${codigoBusqueda}.pdf`);
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

  const volverAlInicio = () => {
    setEstadoBusqueda('idle');
    setTramite(null);
    setCodigoBusqueda('');
  };

  let firmasUsadas = [];
  if (tramite && firmasDB.length > 0) {
    firmasUsadas = firmasDB.filter(f => {
      if (!tramite.firma_digital_url) return false;
      const guardadoStr = String(tramite.firma_digital_url);
      return guardadoStr.includes(String(f.id_usuario)) || guardadoStr.includes(f.firma_digital_url);
    });
    if (firmasUsadas.length === 0) firmasUsadas = [firmasDB[0]]; 
  }

  // Comprobamos si el trámite está finalizado
  const isFinalizado = tramite?.id_estado === 7 || tramite?.nombre_estado === 'Listo para Impresion' || tramite?.nombre_estado === 'Finalizado';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#8B1A1A] selection:text-white bg-gray-50">
      
      {/* HEADER SIEMPRE VISIBLE */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 sm:px-8 flex items-center justify-between z-20 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8B1A1A] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">UV</div>
          <span className="font-bold text-gray-900 text-lg hidden sm:block tracking-wide">Universidad Privada del Valle</span>
        </div>
        <button onClick={() => router.push('/auth/login')} className="text-sm font-bold text-gray-700 hover:text-[#8B1A1A] transition-colors flex items-center gap-2 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-lg">
          <span>👤</span> Iniciar Sesión
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-start pt-10 pb-20 relative px-4 overflow-x-hidden">
        
        {/* FONDO DE LA LANDING (Luces rojas y grises) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[0%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-red-100/40 blur-3xl"></div>
          <div className="absolute bottom-[20%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-gray-200/50 blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">

          {/* ========================================= */}
          {/* VISTA 1: EL BUSCADOR INICIAL              */}
          {/* ========================================= */}
          {(estadoBusqueda !== 'success' || !tramite) && (
            <div className="w-full max-w-2xl text-center mt-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-[#8B1A1A] text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Portal de Verificación Pública
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
                Consulta el estado de tu <br className="hidden sm:block" /><span className="text-[#8B1A1A]">Trámite Universitario</span>
              </h1>
              <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg">
                Ingresa tu código de seguridad para conocer el progreso o verificar la autenticidad de un documento.
              </p>

              <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
                <form onSubmit={handleBuscar} className="flex flex-col gap-4">
                  <div className="text-left">
                    <label htmlFor="codigoTramite" className="block text-sm font-bold text-gray-700 mb-2">Código del Trámite</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-gray-400 text-xl">🔍</span></div>
                      <input
                        id="codigoTramite" type="text" value={codigoBusqueda} onChange={(e) => setCodigoBusqueda(e.target.value)}
                        placeholder="Ej: UV-2026-TRM-1234" className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#8B1A1A] focus:ring-4 focus:ring-red-50 transition-all outline-none font-mono text-gray-800 uppercase" required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={estadoBusqueda === 'loading'} className="w-full bg-[#8B1A1A] hover:bg-[#6b1414] disabled:bg-gray-400 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 text-lg mt-2">
                    {estadoBusqueda === 'loading' ? 'Buscando...' : 'Buscar Documento'} {estadoBusqueda !== 'loading' && <span>→</span>}
                  </button>
                </form>
              </div>

              {estadoBusqueda === 'error' && (
                <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-4 w-full shadow-sm text-left animate-fade-in">
                  <span className="text-2xl">❌</span>
                  <div><p className="font-bold">Búsqueda fallida</p><p className="text-sm">{mensajeError}</p></div>
                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* VISTA 2: TRÁMITE EN PROCESO               */}
          {/* ========================================= */}
          {estadoBusqueda === 'success' && tramite && !isFinalizado && (
            <div className="w-full max-w-2xl text-center mt-8 animate-fade-in">
              <button onClick={volverAlInicio} className="mb-6 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 hover:text-[#8B1A1A] transition-colors flex items-center gap-2 mx-auto shadow-sm">
                <span>←</span> Nueva Búsqueda
              </button>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center w-full">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Trámite en Proceso</h2>
                <p className="text-gray-600 mb-6">El trámite <span className="font-bold text-gray-900">{tramite.tipo_tramite}</span> se encuentra en estado: <span className="text-[#8B1A1A] font-bold uppercase">{tramite.nombre_estado}</span>.</p>
                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl font-medium">
                  Vuelve a consultar más adelante usando el código: <br/><span className="font-mono font-bold text-lg">{codigoBusqueda.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* VISTA 3: VISOR A4 FINAL                   */}
          {/* ========================================= */}
          {estadoBusqueda === 'success' && tramite && isFinalizado && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              
              {/* Botón para volver y Banner de Éxito */}
              <div className="w-full max-w-[210mm] flex justify-between items-center mb-6">
                <button onClick={volverAlInicio} className="bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-[#8B1A1A] font-bold flex items-center gap-2 transition-colors text-sm px-4 py-2 rounded-lg">
                  <span>←</span> Cerrar Documento
                </button>
                <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                  <span>✅</span>
                  <span className="text-green-700 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Documento Auténtico</span>
                </div>
              </div>

              {/* EL DOCUMENTO A4 */}
              <div 
                id="certificado-a4" 
                className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col mx-auto overflow-hidden border border-gray-300"
              >
                {/* Header Rojo */}
                <div className="bg-[#8B1A1A] text-white pt-10 pb-8 px-12">
                  <h1 className="text-2xl font-bold tracking-wide mb-1">UNIVERSIDAD PRIVADA DEL VALLE — UNIVALLE</h1>
                  <p className="text-sm opacity-90 mb-4">Sistema de Gestión de Trámites Académicos</p>
                  <h2 className="text-xl font-black tracking-wide uppercase">CONSTANCIA DE TRÁMITE — DOCUMENTO FINAL</h2>
                </div>

                {/* Cuerpo del Documento */}
                <div className="flex flex-col flex-1 px-12 py-10">
                  <div className="flex justify-between text-sm text-gray-800 mb-10 font-medium border-b border-gray-200 pb-4">
                    <span>N° solicitud: #{tramite.id_tramite}</span>
                    <span>Fecha de emisión: {new Date(tramite.fecha_creacion || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <div className="text-sm text-gray-800 mb-10 space-y-2">
                    <p className="font-bold text-base mb-3 text-gray-900 border-l-4 border-[#8B1A1A] pl-2">Estudiante</p>
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
                          <td className="py-4 px-4 border-x border-gray-200 font-bold text-gray-900">{tramite.tipo_tramite}</td>
                          <td className="py-4 px-4 border-x border-gray-200 text-right font-medium text-gray-700">
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

                  {/* Firmas */}
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

                  {/* QR Code */}
                  <div className="mt-auto flex items-start gap-5 pt-4 pb-4 border-t border-gray-100">
                    <div className="flex flex-col flex-shrink-0">
                      <div className="w-[100px] h-[100px] bg-white border border-gray-300 p-1.5 flex items-center justify-center">
                        <QRCodeSVG value={`${baseUrl}/verificar/${codigoBusqueda}`} size={85} level={"H"} />
                      </div>
                      <span className="text-[9px] font-bold mt-1.5 text-gray-800 text-center">Cód.: {codigoBusqueda.split('-').slice(-1)}</span>
                    </div>
                    <div className="pt-1 flex flex-col justify-center min-w-0">
                      <p className="text-[11px] text-gray-600 leading-snug mb-1">
                        Puede comprobar la autenticidad de esta constancia escaneando el código QR impreso.
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono truncate">
                        Enlace directo: {baseUrl}/verificar/{codigoBusqueda}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Adjuntos */}
              {tramite.archivos && tramite.archivos.filter((d:any) => !String(d.tipo_archivo || d.tipo_documento).includes('Certificado PDF Oficial')).length > 0 && (
                <div className="w-full max-w-[210mm] mt-8 bg-white rounded-xl p-8 shadow-xl border border-gray-100 text-left">
                  <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <span className="text-3xl flex-shrink-0">📁</span> <span>Expediente Digital Adjunto</span>
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
                          <a key={i} href={linkArchivo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl transition-all duration-300 group">
                            <div className="w-12 h-12 min-w-[48px] bg-white rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-red-300 shadow-sm overflow-hidden">
                              <span className="text-2xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{isPdf ? '📄' : '⭐'}</span>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="font-bold text-sm text-gray-800 group-hover:text-[#8B1A1A] truncate leading-tight mb-1" title={nombreArchivo}>{nombreArchivo}</p>
                              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold truncate flex items-center gap-1.5 group-hover:text-red-500"><span className="text-[14px]">🔍</span>Ver documento</p>
                            </div>
                          </a>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Botones de acción inferiores */}
              <div className="w-full max-w-[210mm] mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                <button onClick={() => window.print()} className="bg-white text-gray-900 border border-gray-200 font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 uppercase tracking-wider text-sm">
                  <span className="text-xl">🖨️</span> Imprimir Documento
                </button>
                <button onClick={handleDescargarPDF} disabled={isDownloading} className={`bg-[#8B1A1A] text-white font-black py-4 px-6 rounded-xl shadow-lg hover:bg-[#6b1414] transition-colors flex items-center justify-center gap-3 uppercase tracking-wider text-sm ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className={`text-xl ${isDownloading ? 'animate-bounce' : ''}`}>📥</span> 
                  {isDownloading ? 'Generando PDF...' : 'Descargar Oficial'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER SIEMPRE VISIBLE */}
      <footer className="w-full text-center py-6 text-sm text-gray-400 z-20 relative bg-white border-t border-gray-200 mt-auto">
        <p>© {new Date().getFullYear()} Universidad Privada del Valle. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}