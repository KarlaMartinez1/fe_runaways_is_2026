import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";

const WINDOW_DAYS = 90;
const OCCUPIED_OFFSETS = [4, 5, 6, 13, 14, 21, 22, 23, 31, 32, 40, 47, 48, 49, 55, 70];

export function buildMockAvailability(propertyId: string) {
  const from = todayInElSalvador();
  const to = addDaysIso(from, WINDOW_DAYS - 1);
  const seed = [...propertyId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const shift = seed % 7;

  const occupiedDates = [
    ...new Set(
      OCCUPIED_OFFSETS.map((offset) => offset + shift)
        .filter((offset) => offset < WINDOW_DAYS)
        .map((offset) => addDaysIso(from, offset)),
    ),
  ].sort();

  return { from, to, occupiedDates };
}