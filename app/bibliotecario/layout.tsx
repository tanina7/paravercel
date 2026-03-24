'use client'
import Sidebar from './components/Sidebar';

export default function Layout({ children }: any) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6">{children}</div>
    </div>
  );
}