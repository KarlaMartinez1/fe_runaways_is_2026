export const reportMessages = {
  pageTitle: "Reportes",
  tabs: {
    income: "Ingresos",
    ratings: "Calificaciones",
    occupancy: "Ocupación",
  },
  filter: {
    fromLabel: "Desde",
    toLabel: "Hasta",
    datePlaceholder: "dd/mm/aaaa",
    applyButton: "Aplicar",
    clearButton: "Limpiar",
    invalidDateRange: "La fecha final no puede ser anterior a la inicial.",
    periodExceeded: "El período no puede superar 365 días.",
  },
  summary: {
    title: "Ingresos totales",
    rentalsLabel: "Alquileres",
    retainedDepositsLabel: "Depósitos retenidos",
    disclaimer:
      "Incluye reservas pagadas y finalizadas. Los depósitos pendientes o devueltos no cuentan como ingreso.",
    emptyAmount: "$0.00",
  },
  byProperty: {
    title: "Ingresos por bien",
    periodTotal: (total: string) => `Total del período: ${total}`,
    orderLabel: "Orden",
    orderDesc: "Orden: Mayor a menor",
    orderAsc: "Orden: Menor a mayor",
    headers: {
      property: "Bien",
      lastIncome: "Último ingreso",
      status: "Estado",
      rentals: "Alquileres",
      retainedDeposits: "Depósitos retenidos",
      totalIncome: "Ingreso total",
    },
    noIncome: "sin ingresos",
    noProperties: "Aún no has publicado bienes",
    noPeriodData: "No hay ingresos registrados para el período seleccionado.",
  },
  ratings: {
    title: "Calificación de los bienes",
    updateButton: "Actualizar",
    updatingButton: "Actualizando...",
    orderLabel: "Orden",
    orderDesc: "Orden: Mayor a menor",
    orderAsc: "Orden: Menor a mayor",
    headers: {
      property: "Bien",
      status: "Estado",
      averageRating: "Calificación promedio",
    },
    cardRatingLabel: "Calificación",
    noRatings: "Sin calificaciones",
    readOnlyNotice:
      "Solo lectura: las reseñas no se pueden editar, ocultar ni eliminar desde el panel.",
    formatRatingWithReviews: (rating: number | null, reviewCount: number): string => {
      if (rating === null || reviewCount === 0) return "Sin calificaciones";
      const reviewWord = reviewCount === 1 ? "reseña" : "reseñas";
      return `${rating.toFixed(1)} (${reviewCount} ${reviewWord})`;
    },
  },
  occupancy: {
    title: "Tasa de ocupación",
    filterHelper:
      "Sin período, se usan los últimos 30 días contando hoy. Máximo 365 días.",
    periodApplied: (from: string, to: string, days: number): string => {
      const daysText = days === 1 ? "1 día" : `${days} días`;
      return `Período aplicado: ${from} – ${to} (${daysText})`;
    },
    orderLabel: "Orden",
    orderDesc: "Orden: Mayor a menor",
    orderAsc: "Orden: Menor a mayor",
    headers: {
      property: "Bien",
      status: "Estado",
      occupiedDays: "Días ocupados",
      periodDays: "Días del período",
      occupancyRate: "Tasa de ocupación",
    },
    formatRate: (rate: number | string): string => {
      const num = typeof rate === "number" ? rate : parseFloat(rate) || 0;
      return `${num.toFixed(1)} %`;
    },
  },
  statuses: {
    DISPONIBLE: "Disponible",
    PAUSADO: "Pausado",
    ELIMINADO: "Eliminado",
  },
  errors: {
    loadError: "No se pudo cargar el reporte. Intente de nuevo.",
    retryButton: "Reintentar",
    forbidden: "No tienes permiso para ver esta página.",
  },
  formatCurrency: (amount: number | string): string => {
    const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
    return `$${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },
} as const;
