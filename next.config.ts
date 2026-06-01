import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 🔥 AQUÍ AGREGAMOS LOS PERMISOS PARA TU RED LOCAL
  allowedDevOrigins: ['192.168.0.6', 'http://192.168.0.6:3000', 'localhost'],

  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;