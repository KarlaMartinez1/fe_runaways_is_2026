import { z } from "zod";
import { searchMessages } from "@/lib/messages/properties";

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
});

export type PropertySearchFormData = z.infer<typeof propertySearchSchema>;