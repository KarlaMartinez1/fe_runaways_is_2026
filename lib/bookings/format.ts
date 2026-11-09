const TIME_ZONE = "America/El_Salvador";

const shortDateFormatter = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const deadlineFormatter = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return shortDateFormatter.format(new Date(Date.UTC(year, month - 1, day))).replace(".", "");
}

export function formatShortRange(startDate: string, endDate: string): string {
  return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
}

export function formatDeadline(iso: string): string {
  return deadlineFormatter.format(new Date(iso));
}