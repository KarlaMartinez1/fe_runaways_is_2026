import { blockMessages } from "@/lib/messages/blocks";
import { validateBlockRange } from "./rules";

describe("H12 AC4: validación del rango de bloqueo", () => {
  it("rechaza inicio anterior a hoy, fin anterior al inicio y fechas fuera de 90 días", () => {
    const today = "2026-11-22";

    expect(validateBlockRange("2026-11-21", "2026-11-23", today)).toBe(
      blockMessages.startBeforeToday,
    );
    expect(validateBlockRange("2026-11-24", "2026-11-23", today)).toBe(
      blockMessages.endBeforeStart,
    );
    expect(validateBlockRange("2027-02-20", "2027-02-20", today)).toBe(
      blockMessages.outsideWindow,
    );
  });
});
