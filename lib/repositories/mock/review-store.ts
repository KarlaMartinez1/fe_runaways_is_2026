import type { ReviewListItem } from "@/lib/api/types";
import { propertyFixtures } from "./fixtures/properties";
import { defaultDetailExtras, propertyDetailExtras } from "./fixtures/property-details";
import { rateableReservationSeeds } from "./fixtures/rateable-reservations";

type Aggregate = { sum: number; count: number };

const propertyAggregates = new Map<string, Aggregate>();
// Clave: nombre del arrendador. Es solo un mock; el backend usará el id de usuario.
const ownerAggregates = new Map<string, Aggregate>();
const propertyReviews = new Map<string, ReviewListItem[]>([
  [
    "p-01",
    [
      { id: "p-01-review-01", reviewerName: "Sofía M.", rating: 5, comment: "La quinta estaba limpia y muy bien equipada. Pasamos un día excelente.", createdAt: "2026-10-30T16:00:00.000Z" },
      { id: "p-01-review-02", reviewerName: "Andrés R.", rating: 5, comment: "El espacio es amplio y la piscina estaba en excelentes condiciones.", createdAt: "2026-10-24T16:00:00.000Z" },
      { id: "p-01-review-03", reviewerName: "Camila P.", rating: 5, comment: "Tal como aparece en las fotos. La recomiendo para reuniones familiares.", createdAt: "2026-10-17T16:00:00.000Z" },
      { id: "p-01-review-04", reviewerName: "Diego V.", rating: 5, comment: "Muy buena ubicación y suficiente espacio para todo el grupo.", createdAt: "2026-10-10T16:00:00.000Z" },
      { id: "p-01-review-05", reviewerName: "Lucía C.", rating: 5, comment: "Disfrutamos mucho la estadía. Volveríamos a rentarla.", createdAt: "2026-10-03T16:00:00.000Z" },
      { id: "p-01-review-06", reviewerName: "Mario G.", rating: 5, comment: "Instalaciones cuidadas y un lugar cómodo para compartir.", createdAt: "2026-09-26T16:00:00.000Z" },
      { id: "p-01-review-07", reviewerName: "Daniela F.", rating: 5, comment: "Todo estaba listo cuando llegamos. Muy buena experiencia.", createdAt: "2026-09-19T16:00:00.000Z" },
      { id: "p-01-review-08", reviewerName: "Pablo A.", rating: 5, comment: "La piscina y las áreas verdes fueron lo mejor del lugar.", createdAt: "2026-09-12T16:00:00.000Z" },
      { id: "p-01-review-09", reviewerName: "Mónica L.", rating: 5, comment: "Un lugar agradable, limpio y con buen estacionamiento.", createdAt: "2026-09-05T16:00:00.000Z" },
      { id: "p-01-review-10", reviewerName: "Ricardo S.", rating: 5, comment: "La pasamos muy bien y el espacio cumplió con lo esperado.", createdAt: "2026-08-29T16:00:00.000Z" },
      { id: "p-01-review-11", reviewerName: "Elena B.", rating: 4, comment: "Muy bonito lugar; algunas áreas podrían tener más sombra.", createdAt: "2026-08-22T16:00:00.000Z" },
      { id: "p-01-review-12", reviewerName: "Óscar H.", rating: 4, comment: "Buena experiencia en general y un espacio amplio.", createdAt: "2026-08-15T16:00:00.000Z" },
    ],
  ],
]);
const ownerReviews = new Map<string, ReviewListItem[]>();
const ratedReservationIds = new Set<string>(
  rateableReservationSeeds.filter((seed) => seed.ratedInitially).map((seed) => seed.id),
);

const round1 = (value: number) => Math.round(value * 10) / 10;

function summarize({ sum, count }: Aggregate) {
  return {
    averageRating: count > 0 ? round1(sum / count) : null,
    reviewCount: count,
  };
}

// Punto de partida de un bien: el promedio que ya traen los fixtures.
function getPropertyBaseline(propertyId: string): Aggregate {
  const property = propertyFixtures.find((item) => item.id === propertyId);
  const extras = propertyDetailExtras[propertyId] ?? defaultDetailExtras;
  const average = property?.averageRating ?? null;
  if (average == null) return { sum: 0, count: 0 };
  return { sum: average * extras.reviewCount, count: extras.reviewCount };
}

export function getPropertyOwnerName(propertyId: string): string {
  return (propertyDetailExtras[propertyId] ?? defaultDetailExtras).ownerName;
}

export function getPropertyRatingSummary(propertyId: string) {
  return summarize(propertyAggregates.get(propertyId) ?? getPropertyBaseline(propertyId));
}

export function getOwnerRatingSummary(ownerName: string) {
  return summarize(ownerAggregates.get(ownerName) ?? { sum: 0, count: 0 });
}

export function getPropertyReviews(propertyId: string): ReviewListItem[] {
  return [...(propertyReviews.get(propertyId) ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOwnerReviews(ownerName: string): ReviewListItem[] {
  return [...(ownerReviews.get(ownerName) ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function isReservationRated(reservationId: string): boolean {
  return ratedReservationIds.has(reservationId);
}

type RecordPropertyReviewInput = {
  reservationId: string;
  propertyId: string;
  propertyRating: number;
  userRating: number; // calificación que recibe el arrendador
  comment?: string;
  reviewerName: string;
  createdAt: string;
};

// Registra la reseña y devuelve el promedio ya recalculado del bien.
export function recordPropertyReview({
  reservationId,
  propertyId,
  propertyRating,
  userRating,
  comment,
  reviewerName,
  createdAt,
}: RecordPropertyReviewInput) {
  const ownerName = getPropertyOwnerName(propertyId);

  const property = propertyAggregates.get(propertyId) ?? getPropertyBaseline(propertyId);
  const updatedProperty = { sum: property.sum + propertyRating, count: property.count + 1 };
  propertyAggregates.set(propertyId, updatedProperty);

  const owner = ownerAggregates.get(ownerName) ?? { sum: 0, count: 0 };
  ownerAggregates.set(ownerName, { sum: owner.sum + userRating, count: owner.count + 1 });

  propertyReviews.set(propertyId, [
    ...(propertyReviews.get(propertyId) ?? []),
    { id: reservationId, reviewerName, rating: propertyRating, comment: comment || null, createdAt },
  ]);
  ownerReviews.set(ownerName, [
    ...(ownerReviews.get(ownerName) ?? []),
    { id: reservationId, reviewerName, rating: userRating, comment: null, createdAt },
  ]);

  ratedReservationIds.add(reservationId);
  return summarize(updatedProperty);
}
