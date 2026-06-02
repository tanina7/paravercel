"use client";

import { useEffect, useState } from "react";

interface Tramite {
  id_tipo: number;
  nombre_tramite: string;
  descripcion: string;
  costo: number;
}

export default function GestionPreciosPage() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarTramites = async () => {
    try {
      const response = await fetch("/api/cajero/precios");
      const data = await response.json();
      setTramites(data);
    } catch (error) {
      console.error(error);
      alert("Error cargando trámites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTramites();
  }, []);

  const actualizarPrecio = async (id: number, nuevoCosto: number) => {
    try {
      const response = await fetch(`/api/cajero/precios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ costo: nuevoCosto }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      alert("Precio actualizado correctamente");
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        Cargando trámites...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Precios
        </h1>
        <p className="text-gray-600 mt-1">
          Administra los costos de los trámites del sistema
        </p>
      </div>

      {/* LISTA */}
      <div className="grid gap-5">
        {tramites.map((tramite) => (
          <FilaTramite
            key={tramite.id_tipo}
            tramite={tramite}
            onGuardar={actualizarPrecio}
          />
        ))}
      </div>
    </div>
  );
}

function FilaTramite({
  tramite,
  onGuardar,
}: {
  tramite: Tramite;
  onGuardar: (id: number, costo: number) => void;
}) {
  const [costo, setCosto] = useState(tramite.costo);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition">
      
      {/* INFO */}
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900">
          {tramite.nombre_tramite}
        </h2>

        <p className="text-sm text-gray-600 mt-1">
          {tramite.descripcion}
        </p>
      </div>

      {/* INPUT + BUTTON */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            Precio (Bs)
          </span>

          <input
            type="number"
            value={costo}
            onChange={(e) => setCosto(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 w-32 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          onClick={() => onGuardar(tramite.id_tipo, costo)}
          className="bg-red-900 hover:bg-red-800 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}