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
  // 🟢 APROBAR
  // =========================
  const aceptar = async (id: number) => {
    try {
      await fetch("/api/cajero/procesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_tramite: id,
          aprobar: true,
          comentario: "emitido",
          id_usuario: 1, // Ajusta esto si tienes el ID del cajero real en sesión
        }),
      });

      setData((prev) => prev.filter((t) => t.id_tramite !== id));
    } catch (err) {
      console.error("Error al aprobar:", err);
      alert("Hubo un error al aprobar el trámite.");
    }
  };

  // =========================
  // 🔴 RECHAZAR
  // =========================
  const rechazar = async (id: number) => {
    try {
      if (!window.confirm("¿Estás seguro de que deseas rechazar este trámite?")) return;

      await fetch("/api/cajero/procesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_tramite: id,
          aprobar: false,
          comentario: "rechazado",
          id_usuario: 1, // Ajusta esto si tienes el ID del cajero real en sesión
        }),
      });

      setData((prev) => prev.filter((t) => t.id_tramite !== id));
    } catch (err) {
      console.error("Error al rechazar:", err);
      alert("Hubo un error al rechazar el trámite.");
    }
  };

  // =========================
  // ABRIR TRÁMITE (MODAL)
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
      const res = await fetch("/api/cajero/factura/reconstruir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tramite: t.id_tramite })
      });

      const json = await safeParse(res as unknown as Response);

      if (!res.ok) {
        console.error("abrirTramite error:", res.status, res.statusText, json);
        alert(json?.error || "No se pudo cargar los datos del trámite.");
        return;
      }

      if (json?.pdfUrl) setPreviewUrl(json.pdfUrl);
      setAdjuntos(Array.isArray(json?.adjuntos) ? json.adjuntos : []);
    } catch (err) {
      console.error("abrirTramite error:", err);
      alert("Error de red al cargar el trámite.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GENERAR FACTURA NUEVA
  // =========================
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
        console.error("generarFinal respuesta no OK:", res.status, res.statusText, json);
        const msg = json?.error || json?.__raw || "No se pudo generar la factura.";
        alert(msg);
        return;
      }

      setPreviewUrl(json?.pdfUrl || null);
      setAdjuntos(Array.isArray(json?.adjuntos) ? json.adjuntos : []);
      setEmitida(false);
    } catch (err) {
      console.error("generarFinal error:", err);
      alert("Error de red al generar la factura.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VER FACTURA FINAL Y ADJUNTOS
  // =========================
  const verFacturaFinal = async () => {
    if (!selected) return;

    setLoading(true);
    setPreviewUrl(null);
    setAdjuntos([]);

    try {
      const res = await fetch("/api/cajero/factura/reconstruir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tramite: selected.id_tramite })
      });

      const json = await safeParse(res as unknown as Response);

      if (!res.ok) {
        console.error("Error reconstruyendo factura:", json);
        alert(json?.error || "No se pudo cargar la factura y los adjuntos.");
        return;
      }

      setPreviewUrl(json?.pdfUrl || null);
      setAdjuntos(Array.isArray(json?.adjuntos) ? json.adjuntos : []);

    } catch (err) {
      console.error(err);
      alert("Error de red al cargar la factura y los adjuntos.");
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
    if (!selected) return;

    try {
      const res = await fetch("/api/cajero/factura/eliminar-adjunto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tramite: selected.id_tramite,
          url
        })
      });

      const json = await res.json();
      if (!res.ok) {
        console.error(json);
        alert(json?.error || "No se pudo eliminar el adjunto.");
        return;
      }

      setAdjuntos(prev => prev.filter(a => a !== url));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el archivo adjunto.");
    }
  };

  // =========================
  // EMITIR FACTURA (Finalizar)
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
        alert("Factura emitida y registrada correctamente");
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI PRINCIPAL
  // =========================
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-black">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Trámites</h1>
        <input
          className="border border-gray-300 p-2.5 rounded-lg w-full md:w-80 shadow-sm focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none transition-all"
          placeholder="Buscar por ID, nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="overflow-x-auto rounded-xl shadow-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#8B1A1A] text-white">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Nombre del Solicitante</th>
              <th className="p-4 text-left font-semibold">Correo Electrónico</th>
              <th className="p-4 text-left font-semibold">Estado</th>
              <th className="p-4 text-left font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No se encontraron trámites con esa búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id_tramite} className="hover:bg-blue-50 transition-colors">
                  
                  <td className="p-4 font-bold text-gray-700">#{t.id_tramite}</td>
                  
                  <td className="p-4 text-gray-800 font-medium">{t.nombre_completo}</td>
                  
                  <td className="p-4 text-gray-500">{t.correo}</td>
                  
                  <td className="p-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        t.nombre_estado.toLowerCase() === "pagado" || t.nombre_estado.toLowerCase() === "finalizado"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : t.nombre_estado.toLowerCase() === "rechazado"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      {t.nombre_estado}
                    </span>
                  </td>

                  <td className="p-4 flex gap-2 flex-wrap">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded shadow-sm transition-all active:scale-95"
                      onClick={() => abrirTramite(t)}
                    >
                      👁️ Vista
                    </button>

                    <button
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-1.5 rounded shadow-sm transition-all active:scale-95"
                      onClick={() => aceptar(t.id_tramite)}
                    >
                      ✓ Aceptar
                    </button>

                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-1.5 rounded shadow-sm transition-all active:scale-95"
                      onClick={() => rechazar(t.id_tramite)}
                    >
                      ✕ Rechazar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL (Gestión de Documentos) */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[1100px] flex rounded-2xl overflow-hidden shadow-2xl">

            {/* LADO IZQUIERDO: CONTROLES */}
            <div className="w-1/3 p-6 border-r border-gray-200 bg-gray-50 max-h-[90vh] overflow-y-auto">

              <h2 className="font-bold text-xl text-gray-800">Trámite #{selected.id_tramite}</h2>
              <p className="text-sm text-gray-500 mb-5 pb-4 border-b border-gray-200">{selected.nombre_completo}</p>

              {/* BOTONES PRINCIPALES */}
              <div className="space-y-3 mt-2">

                <button onClick={generarFinal} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-lg shadow-sm transition-colors font-semibold flex items-center justify-center gap-2">
                  <span>🧾</span> Generar Nuevo Documento
                </button>

                <button onClick={verFacturaFinal} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shadow-sm transition-colors font-semibold flex items-center justify-center gap-2">
                  <span>👁️</span> Ver Documento Actual
                </button>

                {/* ZONA DE ADJUNTOS */}
                <div className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Agregar Respaldo:</label>
                  <input
                    type="file"
                    multiple
                    className="w-full text-sm mb-3 text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                  <button
                    onClick={subirArchivos}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white p-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    disabled={emitida || uploading || files.length === 0}
                  >
                    {uploading ? "Subiendo..." : "📎 Adjuntar Archivos"}
                  </button>
                </div>

                {/* EMISIÓN FINAL */}
                <button
                  onClick={emitirFactura}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-2.5 rounded-lg shadow-sm transition-colors font-bold mt-4 flex items-center justify-center gap-2"
                  disabled={emitida}
                >
                  <span>🚀</span> Emitir Factura Final
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white p-2.5 rounded-lg transition-colors mt-2 font-semibold"
                >
                  Cerrar Ventana
                </button>

              </div>

              {/* ADJUNTOS EN COLA */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Listos para subir:</h3>
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="text-xs bg-yellow-50 text-yellow-800 p-2.5 rounded-lg border border-yellow-200 flex items-center font-medium">
                        ⏳ <span className="ml-2 truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LISTA DE ADJUNTOS GUARDADOS */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Documentos Guardados:</h3>
                {adjuntos.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-100 p-3 rounded-lg text-center">No hay respaldos adjuntos.</p>
                ) : (
                  <div className="space-y-2">
                    {adjuntos.map((a, i) => {
                      const filename = a.split('/').pop() || `Archivo ${i+1}`;
                      return (
                        <div key={i} className="flex justify-between items-center text-xs bg-blue-50 text-blue-900 p-2.5 rounded-lg border border-blue-200 font-medium">
                          <span className="truncate max-w-[150px]" title={filename}>
                            📎 {filename}
                          </span>
                          <button onClick={() => eliminarAdjunto(a)} className="text-red-500 hover:text-red-700 ml-2 font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Eliminar archivo">
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
                  <div className="w-12 h-12 border-4 border-[#8B1A1A] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-semibold text-lg">Procesando documentos...</p>
                </div>
              ) : (previewUrl || adjuntos.length > 0) ? (
                <div className="space-y-8 flex flex-col items-center w-full pb-8">
                  
                  {/* VISOR DE LA FACTURA PRINCIPAL */}
                  {previewUrl && (
                    <div className="w-full bg-white p-2 rounded-xl shadow-lg border border-gray-300">
                      <div className="bg-gray-100 p-3 text-center text-sm font-bold text-gray-800 border-b mb-2 uppercase tracking-widest rounded-t-lg">
                        📄 Documento Oficial
                      </div>
                      <iframe src={previewUrl} className="w-full h-[650px] rounded-b-lg" />
                    </div>
                  )}

                  {/* VISOR DE LOS ADJUNTOS (UNO DEBAJO DEL OTRO) */}
                  {adjuntos.map((url, i) => {
                    const filename = url.split('/').pop() || `Adjunto ${i+1}`;
                    const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

                    return (
                      <div key={i} className="w-full bg-white p-2 rounded-xl shadow-lg border border-gray-300">
                        <div className="bg-blue-50 p-3 flex justify-between items-center text-sm font-bold text-blue-900 border-b mb-2 rounded-t-lg">
                          <span className="uppercase tracking-wide">📎 Respaldo: {filename}</span>
                          <a href={url} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline text-xs bg-white px-3 py-1.5 rounded-md border border-blue-200 shadow-sm transition-all">
                            Abrir en pestaña nueva ↗
                          </a>
                        </div>

                        {/* Renderizado de imagen o PDF */}
                        {isImage ? (
                          <div className="flex justify-center bg-gray-50 p-6 rounded-b-lg border border-gray-100">
                            <img src={url} alt={`Adjunto ${i + 1}`} className="max-w-full h-auto max-h-[700px] object-contain rounded shadow-sm border border-gray-200" />
                          </div>
                        ) : (
                          <iframe src={url} className="w-full h-[600px] rounded-b-lg border border-gray-100 bg-gray-50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-7xl mb-4 opacity-50">📄</p>
                  <p className="text-2xl font-bold text-gray-500 mb-2">Sin documentos</p>
                  <p className="text-sm text-gray-400 text-center max-w-xs">
                    Presiona "Generar Nuevo Documento" o sube un archivo adjunto para previsualizarlo aquí.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}