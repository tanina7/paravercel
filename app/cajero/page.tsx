'use client'
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardCards from './components/DashboardCards';
import TableSolicitudes from './components/TableSolicitudes';
import { useState } from 'react';

export default function CajeroPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && <Sidebar close={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 overflow-y-auto">
          <DashboardCards />
          <TableSolicitudes />
        </main>
      </div>
    </div>
  );
}