import { countBookingDays } from "@/lib/bookings/rules";
import { addDaysIso } from "@/lib/utils/dates";

export type StoredBlock = {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export const blocksStore: StoredBlock[] = [];

export function getMockBlockedDates(propertyId: string): string[] {
  const dates = new Set<string>();
  for (const block of blocksStore) {
    if (block.propertyId !== propertyId) continue;
    const days = countBookingDays(block.startDate, block.endDate);
    for (let offset = 0; offset < days; offset++) {
      dates.add(addDaysIso(block.startDate, offset));
    }
  }
  return [...dates];
}