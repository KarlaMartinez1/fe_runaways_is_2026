import { filterMessages, searchMessages } from "@/lib/messages/properties";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";
import { getDateRangeError, parseFilters } from "./property-filters";

// Se fija "hoy" para que la prueba dé el mismo resultado cualquier día.
const today = "2026-11-20";

describe("H8. Filtro por disponibilidad de fechas", () => {
  it("AC1: acepta un rango válido de inicio y fin", () => {
    expect(getDateRangeError("2026-11-21", "2026-11-23", today)).toBeUndefined();
  });

  it("AC1: si se usa el filtro, la fecha de inicio y la de fin son obligatorias", () => {
    expect(getDateRangeError("2026-11-21", "", today)).toBe(searchMessages.datesBoth);
    expect(getDateRangeError("", "2026-11-23", today)).toBe(searchMessages.datesBoth);
    expect(getDateRangeError("", "", today)).toBeUndefined();
  });

  it("AC2: no permite fechas anteriores a hoy", () => {
    expect(getDateRangeError("2026-11-19", "2026-11-23", today)).toBe(searchMessages.dateStartBeforeToday);
    expect(getDateRangeError(today, today, today)).toBeUndefined();
  });

  it("AC3: no permite una fecha de fin anterior a la de inicio", () => {
    expect(getDateRangeError("2026-11-25", "2026-11-22", today)).toBe(searchMessages.dateEndBeforeStart);
  });

  it("AC6: no permite un rango mayor a 30 días contando el inicio y el fin", () => {
    expect(getDateRangeError("2026-11-21", "2026-12-20", today)).toBeUndefined();
    expect(getDateRangeError("2026-11-21", "2026-12-21", today)).toBe(searchMessages.dateTooLong);
  });

  it("AC7: no permite fechas posteriores a los próximos 90 días", () => {
    expect(getDateRangeError("2027-02-10", "2027-02-17", today)).toBeUndefined();
    expect(getDateRangeError("2027-02-10", "2027-02-18", today)).toBe(searchMessages.dateOutsideWindow);
  });

  it("AC1: aplica las fechas de la URL solo si el rango es válido y muestra la etiqueta del filtro", () => {
    const start = addDaysIso(todayInElSalvador(), 1);
    const end = addDaysIso(todayInElSalvador(), 3);

    expect(parseFilters({ startDate: start, endDate: end })).toMatchObject({ startDate: start, endDate: end });
    expect(parseFilters({ startDate: end, endDate: start })).toMatchObject({
      startDate: undefined,
      endDate: undefined,
    });
    expect(filterMessages.dateChip("2026-11-21", "2026-11-23")).toBe("Del 21/11/2026 al 23/11/2026");
  });
});