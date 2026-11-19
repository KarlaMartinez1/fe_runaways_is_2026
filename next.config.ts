import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/bookings/:id/deposit/decision",
        destination: "/bookings/:id/deposit/decision",
      },
    ];
  },
  experimental: {
    // H19: el documento de identidad (máx. 5 MB) y H1: hasta 5 fotos de 5 MB se envían
    // por acciones de servidor, cuyo límite por defecto es 1 MB.
    serverActions: {
      bodySizeLimit: "26mb",
    },
    // proxy.ts intercepta las acciones y por defecto corta el cuerpo en 10 MB.
    proxyClientMaxBodySize: "26mb",
  },
};

export default nextConfig;