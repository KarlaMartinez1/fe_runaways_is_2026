import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // H19: el documento de identidad (máx. 5 MB) se envía por una acción de servidor,
    // cuyo límite por defecto es 1 MB.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;