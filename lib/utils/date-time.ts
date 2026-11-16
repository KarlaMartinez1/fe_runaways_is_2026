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