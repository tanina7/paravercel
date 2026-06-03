'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useCarrito } from '@/app/usuario/context/CarritoContext';
import Header from '../components/Header';

interface DocumentoRequerido {
  tipo: string;
  archivo?: File;
}

interface TramiteDocumentos {
  id: number;
  name: string;
  documentos: DocumentoRequerido[];
}

// Definición de documentos requereridos por tipo de trámite
const DOCUMENTOS_POR_TRAMITE: Record<number, string[]> = {
  1: ['Carta de solicitud de cambio de Sub Sede', 'Fotocopia del carnet de identidad', 'Hoja de solvencia interna'],
  2: ['Carta de solicitud del trámite', 'Fotocopia del carnet de identidad', 'Hoja de solvencia interna'],
  3: ['Carta de solicitud del trámite', 'Fotocopia del carnet de identidad', 'Hoja de solvencia interna'],
  4: ['Carta de solicitud de cambio de plan de estudios', 'Fotocopia del carnet de identidad'],
};

const CARRERAS = [
  'Medicina','Odontología','Bioquímica y Farmacia','Nutrición y Dietética','Fisioterapia y Kinesiología','Enfermería Clínico-Quirúrgica','Administración de Empresas','Ingeniería Comercial','Ingeniería en Comercio Internacional','Ingeniería Financiera y de Riesgos','Derecho y Ciencias Jurídicas','Psicología','Ciencia de Datos e Inteligencia de Negocios','Ingeniería de Sistemas Informáticos','Ingeniería en Telecomunicaciones','Ingeniería Electrónica','Ingeniería Mecatrónica','Ingeniería Biomédica','Ingeniería Civil','Ingeniería Industrial','Ingeniería en Petróleo, Gas y Energías','Ingeniería Ambiental','Ingeniería de Producción e Innovación','Arquitectura y Urbanismo','Diseño Gráfico y Comunicación Visual','Diseño de Interiores y Paisajismo','Artes Escénicas y Producción','Gastronomía y Chef Ejecutivo','Gestión Turística y Hotelera','Administración en Servicios de Alimentación',
];

const SUB_SEDES = [
  'Cochabamba',
  'La Paz',
  'Santa Cruz',
  'Sucre',
  'Trinidad',
];

export default function FormularioPage() {
  const router = useRouter();
  const { items, setSolicitud, vaciarCarrito } = useCarrito();

  const [nombreCompleto, setNombreCompleto] = useState('');
  
  // --- Estados para el Buscador de Carreras ---
  const [carrera, setCarrera] = useState('');
  const [carreraInput, setCarreraInput] = useState('');
  const [mostrarDropdownCarreras, setMostrarDropdownCarreras] = useState(false);
  // ---------------------------------------------

  const [subSede, setSubSede] = useState('');
  const [tramitesConDocumentos, setTramitesConDocumentos] = useState<TramiteDocumentos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Datos, 2: Documentos, 3: Factura, 4: Pago
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [codigoSolicitud, setCodigoSolicitud] = useState('');
  const [tramitesConCodigosSeguimiento, setTramitesConCodigosSeguimiento] = useState<any[]>([]);
  const [totalMonto, setTotalMonto] = useState(0);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [cargandoNombre, setCargandoNombre] = useState(true);
  const [nitCi, setNitCi] = useState('');
  const [nombreFactura, setNombreFactura] = useState('');

  // Lógica del filtro de carreras
  const carrerasFiltradas = CARRERAS.filter((c) =>
    c.toLowerCase().includes(carreraInput.toLowerCase())
  );

  // Inicializar trámites con documentos requeridos y obtener nombre completo
  useEffect(() => {
    if (items.length === 0) {
      router.push('/usuario/carrito');
      return;
    }

    const tramites = items.map((item) => ({
      id: item.id,
      name: item.name,
      documentos: (DOCUMENTOS_POR_TRAMITE[item.id] || []).map((tipo) => ({
        tipo,
        archivo: undefined,
      })),
    }));

    setTramitesConDocumentos(tramites);
  }, [items, router]);

  // Obtener nombre completo desde la base de datos
  useEffect(() => {
    const obtenerNombreCompleto = async () => {
      try {
        setCargandoNombre(true);
        const response = await fetch('/api/usuario/obtener-nombre-completo');
        
        if (response.ok) {
          const data = await response.json();
          setNombreCompleto(data.nombreCompleto);
        } else {
          console.warn('No se pudo obtener nombre completo:', response.statusText);
        }
      } catch (error) {
        console.error('Error obteniendo nombre completo:', error);
      } finally {
        setCargandoNombre(false);
      }
    };

    obtenerNombreCompleto();
  }, []);

  const handleFileChange = (tramiteId: number, docIndex: number, file: File | null) => {
    setTramitesConDocumentos((prevState) =>
      prevState.map((tramite) =>
        tramite.id === tramiteId
          ? {
              ...tramite,
              documentos: tramite.documentos.map((doc, idx) =>
                idx === docIndex ? { ...doc, archivo: file || undefined } : doc
              ),
            }
          : tramite
      )
    );
  };

  const validarDatos = () => {
    if (!nombreCompleto.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }
    if (!carrera) {
      setError('Debe buscar y seleccionar una carrera de la lista');
      return false;
    }
    if (!subSede) {
      setError('Debe seleccionar una sub sede');
      return false;
    }
    return true;
  };

  const validarDocumentos = () => {
    for (const tramite of tramitesConDocumentos) {
      for (const doc of tramite.documentos) {
        if (!doc.archivo) {
          setError(`Debe subir el documento: "${doc.tipo}" para ${tramite.name}`);
          return false;
        }
        if (!doc.archivo.type.includes('pdf')) {
          setError('Solo se aceptan archivos PDF');
          return false;
        }
        if (doc.archivo.size > 5 * 1024 * 1024) {
          setError('El tamaño máximo de archivo es 5MB');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (validarDatos()) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (!validarDocumentos()) {
        return;
      }

      setLoading(true);
      try {
        setSolicitud({
          nombreCompleto,
          carrera,
          subSede,
          documentos: {},
        });

        // Enviar a API
        const response = await fetch('/api/usuario/procesar-solicitud', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombreCompleto,
            carrera,
            subSede,
            tramites: items,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al procesar la solicitud');
        }

        const resultado = await response.json();
        const newSolicitudId = resultado.id_solicitud;
        const newCodigoSolicitud = resultado.codigoSolicitud;
        const tramitesConCodigos = resultado.tramites || [];
        
        setSolicitudId(newSolicitudId);
        setCodigoSolicitud(newCodigoSolicitud);
        setTramitesConCodigosSeguimiento(tramitesConCodigos);
        
        // Calcular monto total
        const monto = items.reduce((sum, item) => sum + item.costo, 0);
        setTotalMonto(monto);

        // Subir archivos
        for (const tramite of tramitesConDocumentos) {
          for (const doc of tramite.documentos) {
            if (doc.archivo) {
              const uploadFormData = new FormData();
              uploadFormData.append('id_solicitud', newSolicitudId.toString());
              uploadFormData.append('nombre_tramite', tramite.name);
              uploadFormData.append('tipo_documento', doc.tipo);
              uploadFormData.append('archivo', doc.archivo);

              const uploadResponse = await fetch('/api/usuario/guardar-archivo', {
                method: 'POST',
                body: uploadFormData,
              });

              if (!uploadResponse.ok) {
                const uploadError = await uploadResponse.json();
                throw new Error(uploadError.error || 'Error al subir archivo');
              }
            }
          }
        }

        setStep(3);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    if (step === 3) {
      if (!nitCi.trim()) {
        setError('El NIT/CI es requerido');
        return;
      }
      if (!nombreFactura.trim()) {
        setError('El nombre para factura es requerido');
        return;
      }

      setLoading(true);
      try {
        const facturaResponse = await fetch('/api/usuario/guardar-factura', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_solicitud: solicitudId,
            nit_ci: nitCi,
            nombre: nombreFactura,
          }),
        });

        if (!facturaResponse.ok) {
          const facturaError = await facturaResponse.json();
          throw new Error(facturaError.error || 'Error al guardar datos de factura');
        }

        setStep(4);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    if (step === 4) {
      if (!comprobante) {
        setError('Debe subir el comprobante de pago');
        return;
      }

      const tiposPermitidos = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const esValido = tiposPermitidos.includes(comprobante.type) || 
                       comprobante.name.toLowerCase().endsWith('.pdf') ||
                       comprobante.name.toLowerCase().endsWith('.png') ||
                       comprobante.name.toLowerCase().endsWith('.jpg') ||
                       comprobante.name.toLowerCase().endsWith('.jpeg');
      
      if (!esValido) {
        setError('Solo se aceptan archivos PDF, PNG o JPG/JPEG');
        return;
      }

      setLoading(true);
      try {
        const pagoFormData = new FormData();
        pagoFormData.append('id_solicitud', solicitudId!.toString());
        pagoFormData.append('monto', totalMonto.toString());
        pagoFormData.append('comprobante', comprobante);

        const pagoResponse = await fetch('/api/usuario/guardar-comprobante', {
          method: 'POST',
          body: pagoFormData,
        });

        if (!pagoResponse.ok) {
          const pagoError = await pagoResponse.json();
          throw new Error(pagoError.error || 'Error al guardar comprobante');
        }

        vaciarCarrito();

        const datosConfirmacion = {
          codigoSolicitud,
          tramites: tramitesConCodigosSeguimiento,
          nombreCompleto,
          totalMonto,
          fechaPago: new Date().toISOString()
        };
        
        try {
          localStorage.setItem('datosConfirmacionPago', JSON.stringify(datosConfirmacion));
        } catch (storageError) {
          console.error('❌ Error al guardar en localStorage:', storageError);
        }
        
        setTimeout(() => {
          router.push('/usuario/confirmacion-pago');
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] text-white py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
              Completar Solicitud de Trámites
            </h2>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              {step === 1 ? 'Ingresa tus datos básicos' : step === 2 ? 'Sube los documentos requeridos' : step === 3 ? 'Completa los datos de facturación' : 'Confirma el pago'}
            </p>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1"><div className={`h-2 rounded-full transition-colors ${step >= 1 ? 'bg-[#8B1A1A]' : 'bg-gray-300'}`}></div></div>
            <div className="px-4 text-center"><p className="text-sm font-semibold text-black">Paso {step} de 4</p></div>
            <div className="flex-1"><div className={`h-2 rounded-full transition-colors ${step >= 2 ? 'bg-[#8B1A1A]' : 'bg-gray-300'}`}></div></div>
            <div className="px-4 text-center"><div className={`h-2 rounded-full transition-colors ${step >= 3 ? 'bg-[#8B1A1A]' : 'bg-gray-300'}`}></div></div>
            <div className="flex-1"><div className={`h-2 rounded-full transition-colors ${step >= 4 ? 'bg-[#8B1A1A]' : 'bg-gray-300'}`}></div></div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-grow py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Step 1: Datos Básicos */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Datos Personales</h3>

                {/* Nombre Completo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all placeholder-gray-600"
                      placeholder="Cargando nombre..."
                      required
                      disabled={cargandoNombre}
                    />
                    {cargandoNombre && (
                      <div className="absolute right-3 top-3 flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carrera (BUSCADOR INTELIGENTE) */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Carrera <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={carreraInput}
                      onChange={(e) => {
                        setCarreraInput(e.target.value);
                        setMostrarDropdownCarreras(true);
                        if (carrera && e.target.value !== carrera) {
                          setCarrera(''); // Resetea la selección si cambia el texto
                        }
                      }}
                      onFocus={() => setMostrarDropdownCarreras(true)}
                      onBlur={() => {
                        // Espera breve para permitir clics en la lista
                        setTimeout(() => {
                          setMostrarDropdownCarreras(false);
                          if (carreraInput !== carrera) {
                            setCarreraInput(carrera);
                          }
                        }, 200);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all"
                      placeholder="Escribe para buscar (Ej: Ingeniería...)"
                      required={!carrera}
                    />
                    
                    {mostrarDropdownCarreras && (
                      <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {carrerasFiltradas.length > 0 ? (
                          carrerasFiltradas.map((car) => (
                            <li
                              key={car}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Evita que se dispare onBlur
                                setCarrera(car);
                                setCarreraInput(car);
                                setMostrarDropdownCarreras(false);
                              }}
                              className="px-4 py-3 cursor-pointer hover:bg-red-50 hover:text-[#8B1A1A] text-gray-700 font-medium transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              {car}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-gray-500 text-sm italic">
                            No se encontraron carreras
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Sub Sede */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subSede}
                    onChange={(e) => setSubSede(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all"
                    required
                  >
                    <option value="">Selecciona una sub sede</option>
                    {SUB_SEDES.map((sede) => (
                      <option key={sede} value={sede}>
                        {sede}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resumen de trámites */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Trámites Solicitados:</h4>
                  <ul className="space-y-2">
                    {items.map((tramite) => (
                      <li key={tramite.id} className="flex items-start">
                        <span className="text-blue-600 mr-3">✓</span>
                        <div>
                          <p className="font-medium text-gray-900">{tramite.name}</p>
                          <p className="text-sm text-gray-600">{tramite.costo} Bs</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Documentos */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Documentos Requeridos</h3>
                </div>

                <div className="p-6 space-y-8">
                  {tramitesConDocumentos.map((tramite, tramiteIdx) => (
                    <div key={tramite.id} className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {tramite.name}
                      </h4>

                      <div className="space-y-4">
                        {tramite.documentos.map((doc, docIdx) => (
                          <div key={docIdx} className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              {doc.tipo} <span className="text-red-500">*</span>
                            </label>

                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileChange(tramite.id, docIdx, e.target.files?.[0] || null)}
                                className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#8B1A1A] file:text-white hover:file:bg-[#6B1415] cursor-pointer"
                              />
                              {doc.archivo && (
                                <span className="text-green-600 font-semibold flex items-center gap-2">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {doc.archivo.name}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Datos de Factura */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Datos de Facturación</h3>
                
                <p className="text-black mb-4">Proporciona los datos para tu factura. El resto de información será completada por nuestro equipo administrativo.</p>

                {/* NIT/CI */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIT / Cédula de Identidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nitCi}
                    onChange={(e) => setNitCi(e.target.value)}
                    placeholder="Ej: 12345678"
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all"
                    required
                  />
                </div>

                {/* Nombre para Factura */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre para Factura <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombreFactura}
                    onChange={(e) => setNombreFactura(e.target.value)}
                    placeholder="Nombre o razón social"
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Nota:</strong> Estos datos serán utilizados para emitir tu factura. Asegúrate de proporcionarlos correctamente.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Pago */}
            {step === 4 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Realizar Pago</h3>
                </div>

                <div className="p-6 space-y-8">
                  {/* Códigos de Seguimiento */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">🔖 Códigos de Seguimiento de Trámites</h4>
                    <div className="space-y-2 text-sm">
                      {tramitesConCodigosSeguimiento.map((tramite, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-green-100">
                          <p><span className="font-medium">{tramite.nombre}:</span> <span className="font-mono font-bold text-green-700">{tramite.codigoTramite}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Información de pago */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Información de Pago</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Monto Total:</span> <span className="text-lg font-bold text-blue-600">{totalMonto} Bs</span></p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <p className="text-center text-gray-700 font-semibold mb-4">
                      Escanea este código QR para realizar el pago:
                    </p>
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                      <QRCodeSVG 
                        value={`TRAMITES-UNIVALLE|${codigoSolicitud}|${totalMonto}Bs|${tramitesConCodigosSeguimiento.map(t => t.codigoTramite).join(',')}`}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-center text-gray-600 text-sm mt-4">
                      Información incluida: Códigos de seguimiento y monto total
                    </p>
                  </div>

                  {/* Comprobante de Pago */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Subir Comprobante de Pago</h4>
                    
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Comprobante de Pago (PDF, PNG, JPG) <span className="text-red-500">*</span>
                      </label>

                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#8B1A1A] file:text-white hover:file:bg-[#6B1415] cursor-pointer"
                        />
                        {comprobante && (
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {comprobante.name}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mt-3">
                        Carga el comprobante de tu pago (PDF, captura de pantalla PNG/JPG, recibo, etc.)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4 justify-between">
              {(step === 2 || step === 3 || step === 4) && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  ← Atrás
                </button>
              )}

              <div className="flex-1"></div>

              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#8B1A1A] to-[#6B1415] hover:shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                {loading ? 'Procesando...' : step === 1 ? 'Siguiente →' : step === 2 ? 'Continuar a Factura →' : step === 3 ? 'Continuar a Pago →' : '✓ Completar Pago'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/usuario/carrito"
            className="text-[#8B1A1A] font-semibold hover:underline inline-flex items-center gap-2"
          >
            ← Volver al carrito
          </Link>
        </div>
      </section>
    </div>
  );
}