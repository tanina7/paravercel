'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

interface DatosConfirmacion {
  codigoSolicitud: string;
  tramites: any[];
  nombreCompleto: string;
  totalMonto: number;
  fechaPago: string;
}

export default function ConfirmacionPagoPage() {
  const router = useRouter();
  const [datos, setDatos] = useState<DatosConfirmacion | null>(null);
  const [intentoRedireccionar, setIntentoRedireccionar] = useState(false);

  useEffect(() => {
    console.log('ConfirmacionPagoPage montada');
    
    // Pequeña espera para permitir que el navegador actualice localStorage
    const timeout = setTimeout(() => {
      console.log('Intentando leer localStorage...');
      const datosGuardados = localStorage.getItem('datosConfirmacionPago');
      
      console.log('Datos en localStorage:', datosGuardados ? 'SÍ' : 'NO');
      
      if (datosGuardados) {
        try {
          console.log('Parseando datos...');
          const datosParsed = JSON.parse(datosGuardados);
          console.log('Datos parseados correctamente:', datosParsed);
          setDatos(datosParsed);
          localStorage.removeItem('datosConfirmacionPago'); // Limpiar después de leer
        } catch (error) {
          console.error('Error al recuperar datos:', error);
          setIntentoRedireccionar(true);
          router.push('/usuario/SeleccionTramites');
        }
      } else {
        console.log('No hay datos en localStorage. Redirigiendo...');
        setIntentoRedireccionar(true);
        router.push('/usuario/SeleccionTramites');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  if (!datos) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header />

      {/* Success Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            ¡Solicitud Registrada!
          </h2>
          <p className="text-lg text-green-100 max-w-2xl mx-auto mb-2">
            Tu pago ha sido procesado exitosamente y tus trámites han sido registrados.
          </p>
          <p className="text-sm text-green-100">
            Recibido el {new Date(datos.fechaPago).toLocaleDateString('es-BO', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Información del estudiante */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen de Solicitud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-black">Nombre del Estudiante</p>
                <p className="text-lg font-semibold text-gray-900">{datos.nombreCompleto}</p>
              </div>
              <div>
                <p className="text-sm text-black">Monto Pagado</p>
                <p className="text-lg font-semibold text-green-600">{datos.totalMonto} Bs</p>
              </div>
            </div>
          </div>

          {/* Trámites Solicitados */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] px-6 py-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                📋 Trámites Solicitados
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {datos.tramites.map((tramite, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">✓</span>
                    <p className="text-lg font-semibold text-gray-900">{tramite.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Información Importante</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✓ Tu pago ha sido procesado correctamente</li>
                  <li>✓ Recibirás un correo de confirmación con todos tus datos</li>
                  <li>✓ Puedes consultar el estado de tus trámites en la sección "Tus Trámites Activos"</li>
                  <li>✓ Tiempo estimado de procesamiento: 5-10 días hábiles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link
              href="/usuario/SeleccionTramites"
              className="px-8 py-3 bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-center"
            >
              Hacer más trámites
            </Link>
            <Link
              href="/usuario/landing"
              className="px-8 py-3 border-2 border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 text-center"
            >
              Consultar estado
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-black">
          <p>¿Necesitas ayuda? Contáctanos a <span className="font-semibold">tramites@univalle.edu</span></p>
        </div>
      </section>
    </div>
  );
}
