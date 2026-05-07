'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; // <-- Aquí agregamos useRouter

// 1. Usamos EXACTAMENTE tu misma interfaz
interface FirmaData {
  id_usuario: number;
  nombre_completo: string;
  foto_perfil_url: string;
  firma_digital_url: string;
}

export default function RevisarTramitePage() {
  const { id } = useParams();
  const router = useRouter(); // <-- Inicializamos el router aquí

  // Estados
  const [firmasDB, setFirmasDB] = useState<FirmaData[]>([]);
  const [firmasSeleccionadas, setFirmasSeleccionadas] = useState<number[]>([]);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [loading, setLoading] = useState(true);

  // 2. Usamos EXACTAMENTE tu misma lógica de fetch
  useEffect(() => {
    fetch('/api/obtener-firmas')
      .then((res) => res.json())
      .then((data) => {
        // Manejamos tanto si devuelve {success: true, firmas: []} como si devuelve un Array directo
        if (data.success && data.firmas) {
          setFirmasDB(data.firmas);
        } else if (Array.isArray(data)) {
          setFirmasDB(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar firmas:", err);
        setLoading(false);
      });
  }, []);

  // Lógica de selección
  const toggleFirma = (idFirma: number) => {
    setFirmasSeleccionadas(prev => 
      prev.includes(idFirma) ? prev.filter(f => f !== idFirma) : [...prev, idFirma]
    );
  };

  const seleccionarTodas = () => {
    if (firmasSeleccionadas.length === firmasDB.length) {
      setFirmasSeleccionadas([]);
    } else {
      setFirmasSeleccionadas(firmasDB.map(f => f.id_usuario));
    }
  };

  // Lógica del PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArchivoPDF(file);
      setNombreArchivo(file.name);
    } else if (file) {
      alert("Por favor, selecciona un archivo en formato PDF.");
    }
  };

  const handleGenerarCertificado = () => {
    if (firmasSeleccionadas.length === 0) {
      alert("Por favor, selecciona al menos una firma.");
      return;
    }

    const formData = new FormData();
    formData.append('id_tramite', id as string);
    formData.append('ids_firmas', JSON.stringify(firmasSeleccionadas));
    if (archivoPDF) {
      formData.append('archivo_respaldo', archivoPDF);
    }

    console.log("Generando con firmas ID:", firmasSeleccionadas);
    console.log("Archivo adjunto:", nombreArchivo);
    
    // Mostramos mensaje de éxito
    alert("¡Trámite procesado correctamente!");
    
    // <-- AQUÍ HACEMOS EL REDIRECCIONAMIENTO AUTOMÁTICO A LA NUEVA PÁGINA
    router.push(`/tramites/emision/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <Link href="/tramites" className="text-gray-400 hover:text-[#8B1A1A] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-xl font-medium text-gray-700">
          Revisar Trámite: <span className="font-bold text-[#8B1A1A]">Legalización de Título</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= COLUMNA IZQUIERDA ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visor de Documento Falso */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center text-sm">
              <span className="font-bold text-gray-700">Documento de Solicitud</span>
              <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-gray-600">download</span>
            </div>
            <div className="bg-[#1e293b] p-10 flex justify-center min-h-[500px]">
               <div className="bg-white w-[400px] h-[550px] shadow-2xl p-10 flex flex-col">
                  <h3 className="text-2xl font-black text-[#8B1A1A] text-center border-b pb-4 mb-8">UNIVALLE</h3>
                  <div className="space-y-4 text-sm">
                    <p className="text-gray-500">Estudiante: <span className="text-gray-900 font-medium ml-1">Ingrid Marcela Zambrana Grandy</span></p>
                    <p className="text-gray-500">Carrera: <span className="text-gray-900 font-medium ml-1">Derecho</span></p>
                    <p className="text-gray-500">Año: <span className="text-gray-900 font-medium ml-1">5to Año</span></p>
                  </div>
               </div>
            </div>
          </div>

          {/* ================= SELECTOR DE FIRMAS REALES ================= */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B1A1A]">draw</span>
                Selección de Firmas
              </h3>
              <button 
                onClick={seleccionarTodas}
                className="text-xs font-bold text-[#8B1A1A] hover:underline uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-lg"
              >
                {firmasSeleccionadas.length === firmasDB.length && firmasDB.length > 0 ? 'Desmarcar Todas' : 'Seleccionar Todas'}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                <p>Cargando firmas autorizadas...</p>
              </div>
            ) : firmasDB.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">folder_off</span>
                <p className="text-gray-500 font-medium">No hay firmas disponibles en la base de datos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {firmasDB.map((firma) => (
                  <label 
                    key={firma.id_usuario} 
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      firmasSeleccionadas.includes(firma.id_usuario) 
                        ? 'border-[#8B1A1A] bg-red-50/30 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-[#8B1A1A] rounded cursor-pointer"
                      checked={firmasSeleccionadas.includes(firma.id_usuario)}
                      onChange={() => toggleFirma(firma.id_usuario)}
                    />
                    
                    <div className="bg-white border border-gray-200 rounded p-1 w-14 h-10 flex items-center justify-center shadow-sm">
                      <img 
                        src={firma.firma_digital_url} 
                        alt="Firma"
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} // Mismo fallback de tu código
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800 leading-tight">{firma.nombre_completo}</span>
                      <span className="text-xs text-gray-400 mt-0.5">ID: {firma.id_usuario}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMNA DERECHA ================= */}
        <div className="space-y-6">
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
              Información del Estudiante
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Nombre Completo</p>
                <p className="font-medium text-gray-900">Ingrid Marcela Zambrana Grandy</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Carrera y Año</p>
                <p className="font-medium text-gray-900">Derecho - 5to Año</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Estado Financiero</p>
                <p className="font-medium text-green-600 flex items-center gap-1 mt-1 bg-green-50 w-fit px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[16px]">verified</span> 
                  Solvente y Pagado
                </p>
              </div>
            </div>
          </div>

          {/* ================= SUBIR PDF ================= */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
              Adjuntar Archivos
            </h3>
            <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              archivoPDF ? 'border-[#8B1A1A] bg-red-50/20' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <span className={`material-symbols-outlined text-4xl mb-3 transition-colors ${archivoPDF ? 'text-[#8B1A1A]' : 'text-gray-300'}`}>
                {archivoPDF ? 'task' : 'cloud_upload'}
              </span>
              <span className="text-sm font-bold text-gray-700">
                {archivoPDF ? 'PDF Seleccionado' : 'Subir Respaldo PDF'}
              </span>
              <span className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">
                {archivoPDF ? nombreArchivo : 'Haz clic para explorar tus archivos'}
              </span>
            </label>
          </div>

          <button 
            onClick={handleGenerarCertificado}
            className="w-full bg-[#8B1A1A] hover:bg-[#701515] text-white py-4 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined">workspace_premium</span>
            Generar Certificado
          </button>
        </div>

      </div>
    </div>
  );
}