const TIME_ZONE = "America/El_Salvador";

const monthFormatter = new Intl.DateTimeFormat("es-SV", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function splitIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function todayInElSalvador(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const { year, month, day } = splitIso(iso);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function toMonthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + delta, 1)).toISOString().slice(0, 7);
}

export function buildMonthCells(monthKey: string): Array<string | null> {
  const [year, month] = monthKey.split("-").map(Number);
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: Array<string | null> = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(`${monthKey}-${String(day).padStart(2, "0")}`);
  }
  return cells;
}

export function formatMonthTitle(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const text = monthFormatter
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(" de ", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatLongDate(iso: string): string {
  const { year, month, day } = splitIso(iso);
  return longDateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}