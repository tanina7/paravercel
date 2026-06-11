import type { NextConfig } from "next";
import path from "path";
import os from "os";

// 
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Filtramos para obtener solo la IP local (IPv4) que no sea interna
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // De respaldo por si estás sin internet
}

const miIP = getLocalIp();

const nextConfig: NextConfig = {
  // Output standalone para Docker
  output: 'standalone',

  // Le pasamos la IP que detectó automáticamente
  allowedDevOrigins: [
    'localhost',
    miIP,
    `http://${miIP}:3000`
  ],

  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;