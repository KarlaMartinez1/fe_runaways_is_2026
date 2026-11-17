// Fecha y hora corta en español, por ejemplo "28 oct 2026, 9:12 a. m.".
const dateTimeFormat = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/El_Salvador",
});

export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

const TIME_ZONE = "America/El_Salvador";

const timeFormat = new Intl.DateTimeFormat("es-SV", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const dayMonthFormat = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});

const dayMonthYearFormat = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

// Fecha local (aaaa-mm-dd) en la zona horaria de El Salvador, para comparar días.
function localDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

// H15: hora del último mensaje en la lista: "10:20 p. m." (hoy), "Ayer" o "30 oct".
export function formatConversationTime(iso: string, yesterdayLabel: string, now = new Date()) {
  const date = new Date(iso);
  if (localDay(date) === localDay(now)) return timeFormat.format(date);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (localDay(date) === localDay(yesterday)) return yesterdayLabel;
  return dayMonthFormat.format(date);
}

// H15: rango de la reserva en el encabezado del chat: "12 nov – 14 nov 2026".
export function formatDateRange(startIso: string, endIso: string) {
  // Las fechas de reserva vienen como "aaaa-mm-dd"; se fijan al mediodía para no cambiar de día.
  const start = new Date(`${startIso.slice(0, 10)}T12:00:00Z`);
  const end = new Date(`${endIso.slice(0, 10)}T12:00:00Z`);
  return `${dayMonthFormat.format(start)} – ${dayMonthYearFormat.format(end)}`;
}