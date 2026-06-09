'use client'

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import DashboardCards from './components/DashboardCards';
import TableSolicitudes from './components/TableSolicitudes';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div className="p-4">Cargando solicitudes...</div>}>
        <TableSolicitudes />
      </Suspense>
    </div>
  );
}