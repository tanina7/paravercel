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
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/cajero/tramites");
    const json = await res.json();
    if (Array.isArray(json)) setData(json);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter(t =>
    t.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    t.correo?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.id_tramite).includes(search)
  );

  // 🔵 SOLO PREVIEW (NO APRUEBA)
  const generarVista = async (id: number) => {
    setLoading(true);

    const res = await fetch("/api/cajero/preview-factura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_tramite: id })
    });

    const json = await res.json();

    if (json.pdfUrl) {
      setPreviewUrl(json.pdfUrl);
    }

    setLoading(false);
  };

  // 🟢 APROBAR
  const aceptar = async (id: number) => {
    await fetch("/api/cajero/procesar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_tramite: id,
        aprobar: true,
        comentario: "emitido",
        id_usuario: 1
      })
    });

    setData(prev => prev.filter(t => t.id_tramite !== id));
  };

  // 🔴 RECHAZAR
  const rechazar = async (id: number) => {
    await fetch("/api/cajero/procesar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_tramite: id,
        aprobar: false,
        comentario: "rechazado",
        id_usuario: 1
      })
    });

    setData(prev => prev.filter(t => t.id_tramite !== id));
  };

  return (
    <div className="p-4 md:p-6 text-black">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Trámites</h1>

        <input
          className="border p-2 rounded w-full md:w-80"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl shadow-lg border bg-white">

        <table className="w-full text-sm">

          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {filtered.map(t => (
              <tr key={t.id_tramite} className="hover:bg-gray-50">

                <td className="p-3 font-medium">#{t.id_tramite}</td>
                <td className="p-3">{t.nombre_completo}</td>
                <td className="p-3 text-gray-600">{t.correo}</td>

                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    t.nombre_estado === "Pagado"
                      ? "bg-green-100 text-green-700"
                      : t.nombre_estado === "Rechazado"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {t.nombre_estado}
                  </span>
                </td>

                <td className="p-3 flex gap-2 flex-wrap">

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelected(t);
                      setShowModal(true);
                    }}
                  >
                    Vista
                  </button>

                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    onClick={() => aceptar(t.id_tramite)}
                  >
                    Aceptar
                  </button>

                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => rechazar(t.id_tramite)}
                  >
                    Rechazar
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl rounded-xl p-5">

            <h2 className="text-lg font-bold mb-2">Vista previa</h2>

            <p className="text-sm mb-3">
              Cliente: {selected.nombre_completo}
            </p>

            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[400px] border"
              />
            )}

            <div className="flex gap-2 mt-4">

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => generarVista(selected.id_tramite)}
              >
                {loading ? "Generando..." : "Generar vista"}
              </button>

              <button
                className="bg-gray-400 px-4 py-2 rounded"
                onClick={() => {
                  setShowModal(false);
                  setSelected(null);
                  setPreviewUrl(null);
                }}
              >
                Cerrar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}