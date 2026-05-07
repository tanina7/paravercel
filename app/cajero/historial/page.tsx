import Historial from "../components/Historial";

export default function HistorialPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Historial de Pagos (Cajero)
      </h1>

      <Historial endpoint="/api/cajero/historial" />
    </div>
  );
}