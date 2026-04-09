'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useCarrito } from '@/app/usuario/context/CarritoContext';

interface DocumentoRequerido {
  tipo: string;
  archivo?: File;
}

interface TramiteDocumentos {
  id: number;
  name: string;
  documentos: DocumentoRequerido[];
}

const DOCUMENTOS_POR_TRAMITE: Record<number, string[]> = {
  1: [
    'Carta de solicitud de cambio de Sub Sede',
    'Fotocopia del carnet de identidad',
    'Hoja de solvencia interna',
  ],
  2: [
    'Carta de solicitud del trámite',
    'Fotocopia del carnet de identidad',
    'Hoja de solvencia interna',
  ],
  3: [
    'Carta de solicitud del trámite',
    'Fotocopia del carnet de identidad',
    'Hoja de solvencia interna',
  ],
  4: [
    'Carta de solicitud de cambio de plan de estudios',
    'Fotocopia del carnet de identidad',
  ],
};

const CARRERAS = [
  'Ingeniería de Sistemas',
  'Ingeniería Civil',
  'Derecho',
  'Medicina',
  'Arquitectura',
  'Contaduría',
  'Psicología',
  'Economía',
  'Marketing',
  'Ingeniería Industrial',
];

const SUB_SEDES = ['Central', 'Tiquipaya', 'Cochabamba', 'Santa Cruz'];

export default function FormularioPage() {
  const router = useRouter();
  const { items, setSolicitud } = useCarrito();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [carrera, setCarrera] = useState('');
  const [subSede, setSubSede] = useState('');
  const [tramitesConDocumentos, setTramitesConDocumentos] = useState<TramiteDocumentos[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [codigoSolicitud, setCodigoSolicitud] = useState('');
  const [tramitesConCodigosSeguimiento, setTramitesConCodigosSeguimiento] = useState<any[]>([]);
  const [totalMonto, setTotalMonto] = useState(0);
  const [comprobante, setComprobante] = useState<File | null>(null);

  // Inicializa trámites con documentos
  useEffect(() => {
    if (items.length === 0) {
      router.push('/usuario/carrito');
      return;
    }

    const tramites = items.map((item) => ({
      id: item.id,
      name: item.name,
      documentos: (DOCUMENTOS_POR_TRAMITE[item.id] || []).map((tipo) => ({ tipo, archivo: undefined })),
    }));

    setTramitesConDocumentos(tramites);
  }, [items, router]);

  const handleFileChange = (tramiteId: number, docIndex: number, file: File | null) => {
    setTramitesConDocumentos((prev) =>
      prev.map((tramite) =>
        tramite.id === tramiteId
          ? { ...tramite, documentos: tramite.documentos.map((doc, idx) => idx === docIndex ? { ...doc, archivo: file || undefined } : doc) }
          : tramite
      )
    );
  };

  const validarDatos = () => {
    if (!nombreCompleto.trim()) { setError('El nombre completo es requerido'); return false; }
    if (!carrera) { setError('Debe seleccionar una carrera'); return false; }
    if (!subSede) { setError('Debe seleccionar una sub sede'); return false; }
    return true;
  };

  const validarDocumentos = () => {
    for (const tramite of tramitesConDocumentos) {
      for (const doc of tramite.documentos) {
        if (!doc.archivo) { setError(`Debe subir el documento: "${doc.tipo}" para ${tramite.name}`); return false; }
        if (!doc.archivo.type.includes('pdf')) { setError('Solo se aceptan archivos PDF'); return false; }
        if (doc.archivo.size > 5 * 1024 * 1024) { setError('El tamaño máximo de archivo es 5MB'); return false; }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (validarDatos()) setStep(2);
      return;
    }

    if (step === 2) {
      if (!validarDocumentos()) return;

      setLoading(true);

      try {
        const usuarioStorage = localStorage.getItem('usuario');
        if (!usuarioStorage) {
          setError('No se encontró el ID del usuario. Por favor, inicia sesión de nuevo.');
          setLoading(false);
          return;
        }

        const usuario = JSON.parse(usuarioStorage);
        if (!usuario.id_estudiante) {
          setError('No se encontró el ID del usuario. Por favor, inicia sesión de nuevo.');
          setLoading(false);
          return;
        }

        setSolicitud({ nombreCompleto, carrera, subSede, documentos: {} });

        const response = await fetch('/api/usuario/procesar-solicitud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_estudiante: usuario.id_estudiante,
            tramites: items,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al procesar solicitud');
          setLoading(false);
          return;
        }

        setSolicitudId(data.id_solicitud);
        setCodigoSolicitud(data.codigoSolicitud);
        setTramitesConCodigosSeguimiento(data.tramites);
        setTotalMonto(items.reduce((sum, t) => sum + t.costo, 0));

        setStep(3);
      } catch {
        setError('Error al procesar solicitud');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 3) {
      if (!comprobante) { setError('Debe subir el comprobante'); return; }

      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('id_solicitud', solicitudId!.toString());
        formData.append('monto', totalMonto.toString());
        formData.append('comprobante', comprobante);

        await fetch('/api/usuario/guardar-comprobante', {
          method: 'POST',
          body: formData,
        });

        router.push('/usuario/confirmacion-pago');
      } catch {
        setError('Error al subir comprobante');
      } finally {
        setLoading(false);
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-600">{error}</p>}

        {step === 1 && (
          <>
            <input placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className="border p-2 w-full" />
            <select value={carrera} onChange={(e) => setCarrera(e.target.value)} className="border p-2 w-full">
              <option value="">Selecciona carrera</option>
              {CARRERAS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={subSede} onChange={(e) => setSubSede(e.target.value)} className="border p-2 w-full">
              <option value="">Selecciona sub sede</option>
              {SUB_SEDES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </>
        )}

        {step === 2 && (
          <>
            {tramitesConDocumentos.map((t) => (
              <div key={t.id}>
                <h3>{t.name}</h3>
                {t.documentos.map((doc, i) => (
                  <input key={i} type="file" accept=".pdf" onChange={(e) => handleFileChange(t.id, i, e.target.files?.[0] || null)} />
                ))}
              </div>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <p>Total: {totalMonto} Bs</p>
            <QRCodeSVG value={`TRAMITES|${codigoSolicitud}|${totalMonto}`} size={200} />
            <input type="file" onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
          </>
        )}

        <button className="bg-red-700 text-white px-4 py-2">{loading ? 'Procesando...' : 'Continuar'}</button>
      </form>
    </div>
  );
}