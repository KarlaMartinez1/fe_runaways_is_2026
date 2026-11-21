import { buildPropertiesHref, filtersToQuery, normalizeText, parseFilters } from "./property-filters";

describe("H6. Búsqueda de bienes por criterios", () => {
  it("AC1: lee el término de búsqueda, la ubicación y las características desde la URL", () => {
    const filters = parseFilters({
      q: "  cámara  ",
      department: "La Libertad",
      municipality: "La Libertad Sur",
      category: "EQUIPO",
      noDeposit: "true",
    });

    expect(filters).toMatchObject({
      q: "cámara",
      department: "La Libertad",
      municipality: "La Libertad Sur",
      category: "EQUIPO",
      noDeposit: true,
    });
  });

  it("AC1: el término de búsqueda debe tener de 2 a 100 caracteres", () => {
    expect(parseFilters({ q: "a" }).q).toBeUndefined();
    expect(parseFilters({ q: "a".repeat(101) }).q).toBeUndefined();
    expect(parseFilters({ q: "tv" }).q).toBe("tv");
  });

  it("AC2: solo acepta las categorías PROPIEDAD o EQUIPO y la opción Sin depósito", () => {
    expect(parseFilters({ category: "PROPIEDAD" }).category).toBe("PROPIEDAD");
    expect(parseFilters({ category: "VEHICULO" }).category).toBeUndefined();
    expect(parseFilters({ noDeposit: "false" }).noDeposit).toBeUndefined();
  });

  it("AC1: el municipio solo se aplica si también se eligió el departamento", () => {
    expect(parseFilters({ municipality: "La Libertad Sur" }).municipality).toBeUndefined();
  });

  it("AC3: combina todos los filtros aplicados en la URL del catálogo", () => {
    expect(buildPropertiesHref({ q: "camara", category: "EQUIPO", noDeposit: true })).toBe(
      "/properties?q=camara&category=EQUIPO&noDeposit=true",
    );
    expect(
      filtersToQuery({ q: "casa", department: "San Salvador", municipality: "San Salvador Centro" }),
    ).toEqual({ q: "casa", department: "San Salvador", municipality: "San Salvador Centro" });
  });

  it("AC5: sin filtros vuelve al catálogo completo", () => {
    expect(buildPropertiesHref({})).toBe("/properties");
    expect(parseFilters({})).toEqual({
      q: undefined,
      department: undefined,
      municipality: undefined,
      category: undefined,
      noDeposit: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  });

  it("AC1: la búsqueda no distingue mayúsculas ni tildes", () => {
    expect(normalizeText("Cámara Fotográfica")).toBe("camara fotografica");
    expect(normalizeText("CABAÑA")).toBe("cabana");
  });
});