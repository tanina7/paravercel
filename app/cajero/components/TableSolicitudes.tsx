'use client'

import React, { useEffect, useState } from "react";

interface Tramite {
  id_tramite: number;
  nombre_completo: string;
  correo: string;
  nombre_estado: string;
}

export default function TableSolicitudes() {

  const [data, setData] = useState<Tramite[]>([]);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Tramite | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [adjuntos, setAdjuntos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emitida, setEmitida] = useState(false);

  // Helper para parseo seguro de responses
  const safeParse = async (res: Response) => {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { __raw: text };
    }
  };

  // =========================
  // FETCH LISTA
  // =========================
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/cajero/tramites");
        const json = await res.json();
        if (Array.isArray(json)) setData(json);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const filtered = data.filter(t =>
    t.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    t.correo?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.id_tramite).includes(search)
  );

  // =========================
  // ABRIR TRÁMITE (FACTURA + ADJUNTOS)
  // =========================
  const abrirTramite = async (t: Tramite) => {
    setSelected(t);
    setShowModal(true);
    setPreviewUrl(null);
    setFiles([]);
    setAdjuntos([]);
    setEmitida(false);
    setLoading(true);

    try {
      const res = await fetch("/api/cajero/factura/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tramite: t.id_tramite })
      });

      const json = await safeParse(res as unknown as Response);

      if (!res.ok) {
        console.error(json);
        const msg = json?.error || json?.__raw || "No se pudo generar la factura del trámite.";
        alert(msg);
        return;
      }

      if (json?.pdfUrl) setPreviewUrl(json.pdfUrl);
      if (json?.adjuntos) setAdjuntos(json.adjuntos);
    } catch (err) {
      console.error(err);
      alert("Error al generar la factura.");
    } finally {
      setLoading(false);
    }
  };

  const generarFinal = async () => {
    if (!selected) return;

    setLoading(true);

    try {
      const res = await fetch("/api/cajero/factura/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tramite: selected.id_tramite })
      });

      const json = await safeParse(res as unknown as Response);

      if (!res.ok) {
        console.error(json);
        const msg = json?.error || json?.__raw || "No se pudo generar la factura.";
        alert(msg);
        return;
      }

      if (json?.pdfUrl) setPreviewUrl(json.pdfUrl);
      if (json?.adjuntos) setAdjuntos(json.adjuntos);
      setEmitida(false);
    } catch (err) {
      console.error(err);
      alert("Error de red al generar la factura.");
    } finally {
      setLoading(false);
    }
  };

  const verFacturaFinal = async () => {
    if (!selected) return;

    setLoading(true);

    try {
      const res = await fetch("/api/cajero/factura/reconstruir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tramite: selected.id_tramite })
      });

      const json = await safeParse(res as unknown as Response);

      if (json?.pdfUrl) setPreviewUrl(json.pdfUrl);
      if (json?.adjuntos) setAdjuntos(json.adjuntos);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUBIR ARCHIVOS
  // =========================
  const subirArchivos = async () => {
    if (!selected || uploading || files.length === 0 || emitida) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("id_tramite", String(selected.id_tramite));
    files.forEach(f => formData.append("files", f));
    try {
      const res = await fetch("/api/cajero/factura/adjuntar", {
        method: "POST",
        body: formData
      });

      const json = await safeParse(res as unknown as Response);

      if (res.ok && json.urlsNuevas) {
        const newAdjuntos = Array.from(new Set([...(json.adjuntos || adjuntos), ...json.urlsNuevas]));
        setAdjuntos(newAdjuntos);
        if (json.pdfUrl) setPreviewUrl(json.pdfUrl);
        setFiles([]);
        setEmitida(false);
        alert("Archivos adjuntados y fusionados en la factura correctamente.");
      } else {
        console.error(json);
        const msg = json?.error || json?.__raw || "Hubo un error al adjuntar los archivos.";
        alert(msg);
      }

    } catch (err) {
      console.error(err);
      alert("Error de red al adjuntar archivos.");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // ELIMINAR ADJUNTO
  // =========================
  const eliminarAdjunto = async (url: string) => {
    setAdjuntos(prev => prev.filter(a => a !== url));

    try {
      await fetch("/api/cajero/factura/eliminar-adjunto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tramite: selected?.id_tramite,
          url
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // EMITIR FACTURA
  // =========================
  const emitirFactura = async () => {
    if (!selected || !previewUrl) return;

    setLoading(true);

    try {
      const res = await fetch("/api/cajero/factura/emitir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tramite: selected.id_tramite,
          pdfUrl: previewUrl
        })
      });

      const json = await res.json();

      if (json.ok) {
        setEmitida(true);
        alert("Factura emitida correctamente");
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Trámites</h1>

        <input
          className="border p-2 rounded w-80"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acción</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(t => (
              <tr key={t.id_tramite} className="border-t">
                <td className="p-3 font-medium">#{t.id_tramite}</td>
                <td className="p-3">{t.nombre_completo}</td>
                <td className="p-3">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    {t.nombre_estado}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                    onClick={() => abrirTramite(t)}
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white w-[1100px] flex rounded-xl overflow-hidden shadow-2xl">

            {/* LADO IZQUIERDO: CONTROLES */}
            <div className="w-1/3 p-5 border-r border-gray-200 bg-gray-50 max-h-[90vh] overflow-y-auto">

              <h2 className="font-bold text-lg text-gray-800">Trámite #{selected.id_tramite}</h2>
              <p className="text-sm text-gray-600 mb-5 pb-3 border-b">{selected.nombre_completo}</p>

              {/* BOTONES PRINCIPALES */}
              <div className="space-y-3 mt-4">

                <button onClick={generarFinal} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded shadow-sm transition-colors font-medium">
                  🧾 Generar Documento
                </button>

                <button onClick={verFacturaFinal} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded shadow-sm transition-colors font-medium">
                  👁️ Ver factura y adjuntos
                </button>

                <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-inner">
                  <label className="block text-xs font-bold text-gray-500 mb-2">AGREGAR RESPALDO:</label>
                  <input
                    type="file"
                    multiple
                    className="w-full text-sm mb-3 text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                  <button
                    onClick={subirArchivos}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white p-2 rounded font-medium transition-colors"
                    disabled={emitida || uploading || files.length === 0}
                  >
                    {uploading ? "Subiendo..." : "📎 Subir Archivos"}
                  </button>
                </div>

                <button
                  onClick={emitirFactura}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-2 rounded shadow-sm transition-colors font-bold mt-4"
                  disabled={emitida}
                >
                  🚀 Emitir factura final
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors mt-2"
                >
                  Cerrar
                </button>

              </div>

              {/* ADJUNTOS EN COLA */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-500 mb-2">LISTOS PARA SUBIR:</h3>
                  <div className="space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="text-xs bg-yellow-100 text-yellow-800 p-2 rounded border border-yellow-200 flex items-center">
                        ⏳ <span className="ml-2 truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LISTA DE ADJUNTOS GUARDADOS */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-500 mb-2">DOCUMENTOS GUARDADOS:</h3>
                {adjuntos.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-100 p-2 rounded">No hay adjuntos.</p>
                ) : (
                  <div className="space-y-2">
                    {adjuntos.map((a, i) => {
                      const filename = a.split('/').pop() || `Archivo ${i+1}`;
                      return (
                        <div key={i} className="flex justify-between items-center text-xs bg-blue-100 text-blue-900 p-2 rounded border border-blue-200">
                          <span className="truncate max-w-[150px]" title={filename}>
                            📎 {filename}
                          </span>
                          <button onClick={() => eliminarAdjunto(a)} className="text-red-500 hover:text-red-700 ml-2 font-bold px-1" title="Eliminar archivo">
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* LADO DERECHO: VISUALIZADOR CENTRAL (SCROLLABLE) */}
            <div className="w-2/3 bg-gray-200 p-6 overflow-y-auto max-h-[90vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600 font-semibold text-lg">Procesando documentos...</p>
                </div>
              ) : (previewUrl || adjuntos.length > 0) ? (
                <div className="space-y-8 flex flex-col items-center w-full">
                  
                  {/* VISOR DE LA FACTURA PRINCIPAL */}
                  {previewUrl && (
                    <div className="w-full bg-white p-2 rounded shadow-lg border border-gray-300">
                      <div className="bg-gray-100 p-2 text-center text-sm font-bold text-gray-700 border-b mb-2 uppercase tracking-wide">
                        📄 Factura Oficial
                      </div>
                      <iframe src={previewUrl} className="w-full h-[600px] rounded" />
                    </div>
                  )}

                  {/* VISOR DE LOS ADJUNTOS (UNO DEBAJO DEL OTRO) */}
                  {adjuntos.map((url, i) => {
                    const filename = url.split('/').pop() || `Adjunto ${i+1}`;
                    const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

                    return (
                      <div key={i} className="w-full bg-white p-2 rounded shadow-lg border border-gray-300">
                        <div className="bg-blue-50 p-2 flex justify-between items-center text-sm font-bold text-blue-800 border-b mb-2">
                          <span className="uppercase tracking-wide">📎 {filename}</span>
                          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-xs bg-white px-2 py-1 rounded border border-blue-200">
                            Abrir en pestaña nueva ↗
                          </a>
                        </div>

                        {/* Si es imagen, la renderiza en grande. Si es PDF, usa un iframe */}
                        {isImage ? (
                          <div className="flex justify-center bg-gray-50 p-4 rounded border border-gray-100">
                            <img src={url} alt={`Adjunto ${i + 1}`} className="max-w-full h-auto max-h-[800px] object-contain rounded shadow-sm" />
                          </div>
                        ) : (
                          <iframe src={url} className="w-full h-[600px] rounded border border-gray-100 bg-gray-50" />
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Espacio final para que el último archivo se vea bien al scrollear */}
                  <div className="h-4 w-full"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-6xl mb-4">📄</p>
                  <p className="text-xl font-medium text-gray-500">Sin documentos para mostrar</p>
                  <p className="text-sm mt-2">Presiona "Generar Documento" o sube un archivo adjunto.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}