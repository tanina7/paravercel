import DashboardCards from "../components/DashboardCards";
import Historial from "../components/Historial";

export default function HistorialPage() {
  return (
    <div className="p-6"> 
     <DashboardCards />
     <Historial endpoint="/api/cajero/historial" />
    </div>
  );
}