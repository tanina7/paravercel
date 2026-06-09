'use client'
import DashboardCards from './components/DashboardCards';
import TableSolicitudes from './components/TableSolicitudes';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div>
      <TableSolicitudes />
    </div>
  );
}