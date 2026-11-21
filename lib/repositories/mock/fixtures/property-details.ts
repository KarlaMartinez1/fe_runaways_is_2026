type DetailExtras = {
  description: string;
  securityDeposit: string;
  ownerName: string;
  reviewCount: number;
};

export const propertyDetailExtras: Record<string, DetailExtras> = {
  "p-01": {
    description:
      "Hermosa quinta ideal para eventos familiares, amplia zona verde, piscina climatizada y estacionamiento privado para 10 autos.",
    securityDeposit: "20.00",
    ownerName: "María López",
    reviewCount: 12,
  },
  "p-02": {
    description: "Cámara mirrorless con lente 18-55 mm, dos baterías y tarjeta de 64 GB. Incluye trípode.",
    securityDeposit: "50.00",
    ownerName: "Carlos Rivas",
    reviewCount: 5,
  },
  "p-14": {
    description: "Bicicleta de montaña talla M con casco incluido. Ideal para rutas de fin de semana.",
    securityDeposit: "0.00",
    ownerName: "Ana Martínez",
    reviewCount: 0,
  },
};

export const defaultDetailExtras: DetailExtras = {
  description: "Bien de prueba para el catálogo de Runaways. Descripción completa del bien en renta.",
  securityDeposit: "20.00",
  ownerName: "Roberto López",
  reviewCount: 3,
};