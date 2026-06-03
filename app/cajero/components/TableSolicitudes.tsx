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

  const [files, setFiles] = useState<FileList | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // =========================
  // FETCH TRÁMITES
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/cajero/tramites");
      const json = await res.json();
      if (Array.isArray(json)) setData(json);
    };

    fetchData();
  }, []);

  const filtered = data.filter(t =>
    t.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    t.correo?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.id_tramite).includes(search)
  );

  // =========================
  // GENERAR FACTURA (TODO EN 1)
  // =========================
  const generarFactura = async () => {
    if (!selected || loading) return;

    setLoading(true);
    setPdfUrl(null);

    try {
      const formData = new FormData();

      formData.append("id_tramite", String(selected.id_tramite));

      if (files) {
        Array.from(files).forEach(file => {
          formData.append("files", file);
        });
      }

      const res = await fetch("/api/cajero/generar", {
        method: "POST",
        body: formData
      });

      const json = await res.json();

      if (json.pdfUrl) {
        setPdfUrl(json.pdfUrl);
      }

    } catch (err) {
      console.error("Error generando factura:", err);
    }

    setLoading(false);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 text-black">

      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Trámites</h1>

        <input
          className="border p-2 rounded w-80"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg shadow">

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
            {filtered.map((t) => (
              <tr key={t.id_tramite} className="border-t hover:bg-gray-50">

                <td className="p-3">#{t.id_tramite}</td>
                <td className="p-3">{t.nombre_completo}</td>

                <td className="p-3">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    {t.nombre_estado}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelected(t);
                      setShowModal(true);
                      setPdfUrl(null);
                      setFiles(null);
                    }}
                  >
                    Generar factura
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white w-[800px] p-5 rounded-lg">

            <h2 className="text-lg font-bold mb-2">
              Generar Factura
            </h2>

            <p className="text-sm mb-3">
              Trámite #{selected.id_tramite}
            </p>

            {/* FILES */}
            <input
              type="file"
              multiple
              className="mb-3"
              onChange={(e) => setFiles(e.target.files)}
            />

            {/* BUTTON */}
            <button
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={generarFactura}
            >
              {loading ? "Generando..." : "Generar PDF"}
            </button>

            {/* PDF */}
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-[500px] mt-4 border"
              />
            )}

            <button
              className="mt-3 text-red-600"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>

          </div>

        </div>
      )}

    </div>
  );
}