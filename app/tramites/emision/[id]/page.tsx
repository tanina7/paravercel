'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code'; // <-- Librería para el QR real

export default function VistaPreviaEmisionPage() {
  const { id } = useParams();
  const router = useRouter(); // <-- Para poder redirigir al inicio

  // ==========================================
  // ESTADOS Y GENERADORES AUTOMÁTICOS
  // ==========================================
  const [certNumber, setCertNumber] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [fechaActual, setFechaActual] = useState('');

  // Simulamos los datos que llegarían de la base de datos para este trámite
  const mockDatosTramite = {
    estudiante: "INGRID MARCELA ZAMBRANA GRANDY",
    detalle: "Título en Licenciatura en Ingeniería en Sistemas Informáticos",
    firmas: "Dr. Director de Carrera, Lic. Vicerrector Académico",
  };

  useEffect(() => {
    // 1. Generar Número de Certificado
    const randomCert = Math.floor(100000 + Math.random() * 900000);
    setCertNumber(`CERT-2026-${randomCert}`);

    // 2. Generar Código de Seguridad
    const randomCode = Math.random().toString(36).substring(2, 12).toUpperCase();
    setSecurityCode(randomCode);

    // 3. Obtener fecha formateada
    const opcionesFecha: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    setFechaActual(new Date().toLocaleDateString('es-ES', opcionesFecha));
  }, []);

  // Función combinada: Finalizar, Imprimir y Volver al inicio
  const handleFinalizar = () => {
    // 1. Mostramos la alerta de éxito
    alert(`¡Trámite finalizado y emitido con el código ${securityCode}!`);
    
    // 2. Abrimos la ventana de impresión automáticamente
    window.print();
    
    // 3. Una vez que el usuario imprima (o cancele la impresión), lo mandamos al menú principal
    router.push('/tramites');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 print:hidden">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-[#8B1A1A] transition-colors flex items-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          Vista Previa de Emisión
        </h2>
      </div>

      {/* Contenedor Gris de Fondo */}
      <div className="bg-slate-50 p-8 md:p-12 rounded-2xl border border-gray-200 print:bg-white print:p-0 print:border-none">
        
        {/* ================= LA HOJA DEL CERTIFICADO ================= */}
        <div className="bg-white max-w-3xl mx-auto shadow-xl rounded-lg p-10 md:p-16 border border-gray-100 relative print:shadow-none print:border-none print:p-0">
          
          {/* Encabezado del documento */}
          <div className="text-center mb-8">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
              Resolución Ministerial N° 0088/2023 de 15 de marzo de 2023
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight relative inline-block pb-2">
              LEGALIZACIÓN / CERTIFICACIÓN
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full print:bg-black"></span>
            </h1>
          </div>

          {/* Texto introductorio */}
          <div className="border border-gray-300 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-700 text-justify leading-relaxed">
              El Ministerio de Educación del Estado Plurinacional de Bolivia, a través de la Dirección General de Educación Superior Universitaria, certifica a favor de:
            </p>
          </div>

          {/* Nombre Destacado */}
          <div className="bg-[#e6f0fa] print:bg-gray-100 rounded-md py-4 px-6 mb-8 text-center border border-[#cce0f5] print:border-gray-300">
            <h2 className="text-lg md:text-xl font-black text-[#1e3a5f] print:text-black tracking-wide">
              {mockDatosTramite.estudiante}
            </h2>
          </div>

          {/* Tabla de Datos */}
          <div className="overflow-hidden rounded-md border border-gray-300 mb-10">
            <table className="w-full text-sm text-left border-collapse">
              <tbody className="divide-y divide-gray-300">
                
                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">Detalle del documento:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-medium text-gray-900">{mockDatosTramite.detalle}</td>
                </tr>
                
                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">Firmado por:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-medium text-gray-900">{mockDatosTramite.firmas}</td>
                </tr>

                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">Fecha:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-medium text-gray-900">{fechaActual}</td>
                </tr>

                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">Objetivo:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-medium text-gray-900">Legalización</td>
                </tr>

                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">Responsable:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-medium text-gray-900">Unidad Univalle</td>
                </tr>

                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">N° de certificado:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-bold text-gray-900">{certNumber}</td>
                </tr>

                <tr className="divide-x divide-gray-300">
                  <td className="w-1/3 py-3 px-4 bg-gray-50 print:bg-white font-bold text-gray-800 text-right text-xs uppercase tracking-wider">Código de seguridad:</td>
                  <td className="w-2/3 py-3 px-4 text-center font-mono font-bold text-[#8B1A1A] print:text-black tracking-widest">{securityCode}</td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Footer del Certificado & QR REAL */}
          <div className="flex items-center justify-between gap-6">
            <p className="text-xs text-gray-500 text-justify leading-relaxed flex-1">
              Se certifica que la firma que antecede corresponde al funcionario autorizado y que el presente documento tiene plena validez legal conforme a la normativa vigente. Puede verificar la autenticidad de este documento escaneando el código QR.
            </p>
            
            {/* Generador de QR Real */}
            <div className="border border-gray-200 rounded p-2 flex flex-col items-center justify-center bg-white shadow-sm">
              {/* Le pasamos una URL ficticia de validación unida al código de seguridad */}
              <QRCode 
                value={`https://sistema-univalle.edu.bo/verificar/${securityCode}`} 
                size={80} 
                level="H"
              />
              <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-2">Escanea para validar</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTONES DE ACCIÓN (Se ocultan al imprimir) ================= */}
      <div className="flex justify-center items-center gap-4 pt-4 print:hidden">
        <button 
          onClick={handleFinalizar}
          className="bg-[#8B1A1A] hover:bg-[#701515] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          FINALIZAR Y EMITIR
        </button>

        <button 
          onClick={() => window.print()}
          className="bg-[#334155] hover:bg-[#1e293b] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Solo Imprimir
        </button>
      </div>

    </div>
  );
}