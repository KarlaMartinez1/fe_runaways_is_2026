import { parseFilters } from "@/lib/filters/property-filters";
import { searchMessages } from "@/lib/messages/properties";
import { getPriceRangeError, propertySearchSchema } from "./property-search";

const emptySearch = {
  q: "",
  department: "",
  municipality: "",
  category: "" as const,
  noDeposit: false,
  minPrice: "",
  maxPrice: "",
  startDate: "",
  endDate: "",
};

function priceErrors(minPrice: string, maxPrice = "") {
  const result = propertySearchSchema.safeParse({ ...emptySearch, minPrice, maxPrice });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("H7. Filtro por rango de precio", () => {
  it("AC1: solo acepta valores numéricos positivos", () => {
    expect(priceErrors("abc")).toContain(searchMessages.priceInvalid);
    expect(priceErrors("0")).toContain(searchMessages.priceInvalid);
    expect(priceErrors("-5")).toContain(searchMessages.priceInvalid);
    expect(priceErrors("25.50")).toEqual([]);
  });

  it("AC1: acepta máximo 2 decimales y hasta $9999.99", () => {
    expect(priceErrors("10.555")).toContain(searchMessages.priceDecimals);
    expect(priceErrors("10000")).toContain(searchMessages.priceTooHigh);
    expect(priceErrors("9999.99")).toEqual([]);
  });

  it("AC2: no permite un precio mínimo mayor que el máximo y muestra el error", () => {
    expect(getPriceRangeError("50", "10")).toBe(searchMessages.priceRange);
    expect(getPriceRangeError("10", "50")).toBeUndefined();
  });

  it("AC3: incluye los valores límite cuando el mínimo y el máximo son iguales", () => {
    expect(getPriceRangeError("30", "30")).toBeUndefined();
    expect(parseFilters({ minPrice: "30", maxPrice: "30" })).toMatchObject({ minPrice: 30, maxPrice: 30 });
  });

  it("AC4: permite definir solo el mínimo o solo el máximo", () => {
    expect(priceErrors("20", "")).toEqual([]);
    expect(priceErrors("", "40")).toEqual([]);
    expect(getPriceRangeError("20", "")).toBeUndefined();
    expect(parseFilters({ minPrice: "20" })).toMatchObject({ minPrice: 20, maxPrice: undefined });
    expect(parseFilters({ maxPrice: "40" })).toMatchObject({ minPrice: undefined, maxPrice: 40 });
  });

  it("AC2: ignora el filtro de precio si llega invertido en la URL", () => {
    expect(parseFilters({ minPrice: "50", maxPrice: "10" })).toMatchObject({
      minPrice: undefined,
      maxPrice: undefined,
    });
  });
});