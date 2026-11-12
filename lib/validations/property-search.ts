import { z } from "zod";
import { PRICE_MAX, PRICE_MIN } from "@/lib/filters/property-filters";
import { searchMessages } from "@/lib/messages/properties";

function priceField() {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") return;

      if (!/^\d+(\.\d+)?$/.test(value)) {
        ctx.addIssue({ code: "custom", message: searchMessages.priceInvalid });
        return;
      }

      const decimals = value.split(".")[1] ?? "";
      if (decimals.length > 2) {
        ctx.addIssue({ code: "custom", message: searchMessages.priceDecimals });
        return;
      }

      const price = Number(value);
      if (price < PRICE_MIN) {
        ctx.addIssue({ code: "custom", message: searchMessages.priceInvalid });
      } else if (price > PRICE_MAX) {
        ctx.addIssue({ code: "custom", message: searchMessages.priceTooHigh });
      }
    });
}

export const propertySearchSchema = z.object({
  q: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 2, searchMessages.minLength)
    .refine((value) => value.length <= 100, searchMessages.maxLength),
  department: z.string(),
  municipality: z.string(),
  category: z.enum(["", "PROPIEDAD", "EQUIPO"]),
  noDeposit: z.boolean(),
  minPrice: priceField(),
  maxPrice: priceField(),
});

export type PropertySearchFormData = z.infer<typeof propertySearchSchema>;

// Se usa solo cuando los dos campos tienen un número válido.
export function getPriceRangeError(min: string, max: string) {
  const low = min.trim();
  const high = max.trim();
  if (low === "" || high === "") return undefined;

  const lowValue = Number(low);
  const highValue = Number(high);
  if (Number.isNaN(lowValue) || Number.isNaN(highValue)) return undefined;

  return lowValue > highValue ? searchMessages.priceRange : undefined;
}