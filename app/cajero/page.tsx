'use client'
import DashboardCards from './components/DashboardCards';
import TableSolicitudes from './components/TableSolicitudes';
import Link from "next/link";
export default function CajeroPage() {
  return (
    <div className="space-y-6">
      {/* CARDS */}
      <DashboardCards />
      {/* TABLA */}
      <TableSolicitudes />
      
    </div>
  );
}