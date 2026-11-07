import type { Property } from "@/lib/api/types";

function photo(seed: string) {
  return `https://picsum.photos/seed/${seed}/600/400`;
}

export const propertyFixtures: Property[] = [
  { id: "p-01", title: "Quinta Las Cascadas", category: "PROPIEDAD", department: "La Libertad", municipality: "Santa Tecla", pricePerDay: "45.00", images: [photo("quinta")], status: "DISPONIBLE", createdAt: "2026-11-05T10:00:00Z", averageRating: 4.8 },
  { id: "p-02", title: "Cámara mirrorless", category: "EQUIPO", department: "La Libertad", municipality: "Santa Tecla", pricePerDay: "25.00", images: [photo("camara")], status: "DISPONIBLE", createdAt: "2026-11-04T10:00:00Z", averageRating: 4.6 },
  { id: "p-03", title: "Casa de playa El Tunco", category: "PROPIEDAD", department: "La Libertad", municipality: "Tamanique", pricePerDay: "90.00", images: [photo("playa")], status: "DISPONIBLE", createdAt: "2026-11-03T10:00:00Z", averageRating: null },
  { id: "p-04", title: "Proyector 4K", category: "EQUIPO", department: "San Salvador", municipality: "San Salvador", pricePerDay: "18.00", images: [photo("proyector")], status: "DISPONIBLE", createdAt: "2026-11-02T10:00:00Z", averageRating: null },
  { id: "p-05", title: "Cabaña en El Boquerón", category: "PROPIEDAD", department: "San Salvador", municipality: "San Salvador", pricePerDay: "60.00", images: [photo("cabana")], status: "DISPONIBLE", createdAt: "2026-11-01T10:00:00Z", averageRating: 4.2 },
  { id: "p-06", title: "Dron con cámara", category: "EQUIPO", department: "Santa Ana", municipality: "Santa Ana", pricePerDay: "35.00", images: [photo("dron")], status: "DISPONIBLE", createdAt: "2026-10-31T10:00:00Z", averageRating: 5 },
  { id: "p-07", title: "Salón de eventos Los Pinos", category: "PROPIEDAD", department: "Santa Ana", municipality: "Santa Ana", pricePerDay: "120.00", images: [photo("salon")], status: "DISPONIBLE", createdAt: "2026-10-30T10:00:00Z", averageRating: null },
  { id: "p-08", title: "Equipo de sonido", category: "EQUIPO", department: "San Miguel", municipality: "San Miguel", pricePerDay: "40.00", images: [photo("sonido")], status: "DISPONIBLE", createdAt: "2026-10-29T10:00:00Z", averageRating: 3.9 },
  { id: "p-09", title: "Apartamento en Antiguo Cuscatlán", category: "PROPIEDAD", department: "La Libertad", municipality: "Antiguo Cuscatlán", pricePerDay: "55.00", images: [photo("apto")], status: "DISPONIBLE", createdAt: "2026-10-28T10:00:00Z", averageRating: null },
  { id: "p-10", title: "Laptop para diseño", category: "EQUIPO", department: "San Salvador", municipality: "San Salvador", pricePerDay: "30.00", images: [photo("laptop")], status: "DISPONIBLE", createdAt: "2026-10-27T10:00:00Z", averageRating: 4.4 },
  { id: "p-11", title: "Finca en Apaneca", category: "PROPIEDAD", department: "Ahuachapán", municipality: "Apaneca", pricePerDay: "75.00", images: [photo("finca")], status: "DISPONIBLE", createdAt: "2026-10-26T10:00:00Z", averageRating: null },
  { id: "p-12", title: "Kit de iluminación", category: "EQUIPO", department: "La Libertad", municipality: "Santa Tecla", pricePerDay: "22.00", images: [photo("luces")], status: "DISPONIBLE", createdAt: "2026-10-25T10:00:00Z", averageRating: null },
  { id: "p-13", title: "Casa de campo en Suchitoto", category: "PROPIEDAD", department: "Cuscatlán", municipality: "Suchitoto", pricePerDay: "65.00", images: [photo("suchitoto")], status: "DISPONIBLE", createdAt: "2026-10-24T10:00:00Z", averageRating: 4.7 },
  { id: "p-14", title: "Bicicleta de montaña", category: "EQUIPO", department: "San Salvador", municipality: "San Salvador", pricePerDay: "12.00", images: [], status: "DISPONIBLE", createdAt: "2026-10-23T10:00:00Z", averageRating: null },
  { id: "p-15", title: "Toldo para eventos", category: "EQUIPO", department: "La Libertad", municipality: "Santa Tecla", pricePerDay: "28.00", images: [photo("toldo")], status: "PAUSADO", createdAt: "2026-11-06T10:00:00Z", averageRating: null },
];