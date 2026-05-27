'use client';

import { useState } from 'react';

export default function CrearFirmaPage() {
  // Estados para los datos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rol, setRol] = useState('');

  // Estados para las imágenes
  const [fotoEstudiante, setFotoEstudiante] = useState<string | null>(null);
  const [fotoFirma, setFotoFirma] = useState<string | null>(null);
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [archivoFirma, setArchivoFirma] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  
  // Estado para nuestro "Mensaje Bonito"
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: '', mensaje: '' });

  const mostrarNotificacion = (tipo: 'exito' | 'error', mensaje: string) => {
    setNotificacion({ mostrar: true, tipo, mensaje });
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: '', mensaje: '' });
    }, 4000);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>, 
    setPreview: (value: string | null) => void,
    setFile: (file: File | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarIdentidad = async () => {
    // 1. Validamos que no falte nada
    if (!nombre || !apellido || !rol || !archivoFoto || !archivoFirma) {
      mostrarNotificacion('error', 'Por favor, completa todos los datos y sube ambas imágenes.');
      return;
    }

    setLoading(true);
    
    // 2. Preparamos los datos
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('rol', rol);
    formData.append('foto', archivoFoto);
    formData.append('firma', archivoFirma);
    
    // 🔥 SOLUCIÓN DEL BUG: 
    // Eliminamos el id_usuario hardcodeado. 
    // Ahora el backend debe hacer un INSERT y la BD le dará un ID nuevo automático.

    try {
      const response = await fetch('/api/guardar-firma', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        mostrarNotificacion('exito', '¡Identidad y firma digital registradas correctamente!');
        
        // Limpiamos el formulario
        setNombre('');
        setApellido('');
        setRol('');
        setFotoEstudiante(null);
        setFotoFirma(null);
        setArchivoFoto(null);
        setArchivoFirma(null);
      } else {
        const errorData = await response.json();
        // Mostrar mensaje específico si el backend rechaza un segundo Rector
        mostrarNotificacion('error', errorData.error || 'Hubo un problema al guardar en la base de datos.');
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 space-y-8 relative pb-12">
      
      {/* --- NOTIFICACIÓN FLOTANTE --- */}
      {notificacion.mostrar && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all animate-in slide-in-from-top-8 ${
          notificacion.tipo === 'exito' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-[#8B1A1A]'
        }`}>
          <span className={`material-symbols-outlined text-2xl ${notificacion.tipo === 'exito' ? 'text-green-600' : 'text-[#8B1A1A]'}`}>
            {notificacion.tipo === 'exito' ? 'check_circle' : 'error'}
          </span>
          <p className={`font-medium ${notificacion.tipo === 'exito' ? 'text-green-800' : 'text-red-800'}`}>
            {notificacion.mensaje}
          </p>
        </div>
      )}

      {/* Encabezado */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Registro de Identidad y Firma</h2>
        <p className="text-gray-500 mt-2">Completa los datos para registrar autoridades o estudiantes en el sistema de trámites.</p>
      </div>

      {/* SECCIÓN 1: Datos Personales */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <span className="material-symbols-outlined text-[#8B1A1A]">badge</span>
          <h3 className="text-lg font-bold text-gray-800">1. Información del Usuario</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-950 mb-2">Nombres</label>
            <input 
              type="text" 
              placeholder="Ej. Ingrid Marcela"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border-2 border-black rounded-xl px-4 py-3 text-gray-950 placeholder-gray-700 font-medium focus:ring-2 focus:ring-[#8B1A1A]/50 focus:border-[#8B1A1A] outline-none transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-950 mb-2">Apellidos</label>
            <input 
              type="text" 
              placeholder="Ej. Zambrana Grandy"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full border-2 border-black rounded-xl px-4 py-3 text-gray-950 placeholder-gray-700 font-medium focus:ring-2 focus:ring-[#8B1A1A]/50 focus:border-[#8B1A1A] outline-none transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-950 mb-2">Rol Asignado</label>
            <div className="relative">
              <select 
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-gray-950 font-bold focus:ring-2 focus:ring-[#8B1A1A]/50 focus:border-[#8B1A1A] outline-none transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="" disabled>Seleccione un rol...</option>
                <option value="Estudiante">Estudiante</option>
                <option value="Director de Carrera">Director de Carrera</option>
                <option value="Vicerrector Académico">Vicerrector Académico</option>
                <option value="Rector">Rector (Cargo Único)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-black pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Archivos Digitales */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <span className="material-symbols-outlined text-[#8B1A1A]">upload_file</span>
          <h3 className="text-lg font-bold text-gray-800">2. Documentos Digitales</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta de Foto */}
          <div className="relative border-2 border-dashed border-black rounded-2xl hover:border-[#8B1A1A] hover:bg-red-50/30 transition-all group overflow-hidden bg-white">
            <input 
              type="file" accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => handleFileChange(e, setFotoEstudiante, setArchivoFoto)}
            />
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
              {fotoEstudiante ? (
                <div className="relative">
                  <img src={fotoEstudiante} alt="Vista previa" className="w-32 h-32 object-cover rounded-full shadow-lg border-4 border-white" />
                  <div className="absolute bottom-0 right-0 bg-[#8B1A1A] text-white p-1.5 rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl text-black">photo_camera</span>
                  </div>
                  <h4 className="font-bold text-black">Fotografía del Usuario</h4>
                  <p className="text-xs text-gray-700 max-w-[200px]">Haz clic o arrastra una imagen. Formatos: JPG, PNG.</p>
                </>
              )}
            </div>
          </div>

          {/* Tarjeta de Firma */}
          <div className="relative border-2 border-dashed border-black rounded-2xl hover:border-[#8B1A1A] hover:bg-red-50/30 transition-all group overflow-hidden bg-white">
            <input 
              type="file" accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => handleFileChange(e, setFotoFirma, setArchivoFirma)}
            />
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
              {fotoFirma ? (
                <div className="relative bg-white p-4 rounded-xl shadow-sm border border-black">
                  <img src={fotoFirma} alt="Vista previa firma" className="max-w-[200px] h-24 object-contain" />
                  <div className="absolute -top-3 -right-3 bg-[#8B1A1A] text-white p-1.5 rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl text-black">draw</span>
                  </div>
                  <h4 className="font-bold text-black">Firma Escaneada</h4>
                  <p className="text-xs text-gray-700 max-w-[200px]">Sube una imagen clara de la firma con fondo blanco.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón Final */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={guardarIdentidad}
          disabled={loading}
          className={`bg-[#8B1A1A] text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:bg-[#701515] hover:shadow-xl transition-all flex items-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              Guardando en servidor...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">how_to_reg</span>
              Registrar Autoridad
            </>
          )}
        </button>
      </div>

    </div>
  );
}