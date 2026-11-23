import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // H19: el documento de identidad (máx. 5 MB) y H1: hasta 5 fotos de 5 MB se envían
    // por acciones de servidor, cuyo límite por defecto es 1 MB.
    serverActions: {
      bodySizeLimit: "26mb",
    },
    // proxy.ts intercepta las acciones y por defecto corta el cuerpo en 10 MB.
    proxyClientMaxBodySize: "26mb",
  },
  async redirects() {
    return [
      {
        source: "/reports",
        destination: "/owner/reports",
        permanent: false,
      },
      {
        source: "/lessor/reports",
        destination: "/owner/reports",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;