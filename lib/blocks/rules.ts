import { blockMessages } from "@/lib/messages/blocks";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";

export const BLOCK_WINDOW_DAYS = 90;

export function validateBlockRange(
  startDate: string | null,
  endDate: string | null,
  today: string = todayInElSalvador(),
): string | null {
  if (!startDate || !endDate) return blockMessages.selectBothDates;
  if (startDate < today) return blockMessages.startBeforeToday;
  if (endDate < startDate) return blockMessages.endBeforeStart;
  if (endDate > addDaysIso(today, BLOCK_WINDOW_DAYS - 1)) return blockMessages.outsideWindow;
  return null;
}