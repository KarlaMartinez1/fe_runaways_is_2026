import { propertyFormMessages as m } from "@/lib/messages/property-form";
import {
  PHOTO_MAX_BYTES,
  getPhotoCountError,
  getPhotoFileError,
  propertyFormSchema,
  toMoney,
} from "./property-form";

const validProperty = {
  title: "Cámara Canon EOS",
  description: "Cámara en excelente estado con lente de 50 mm incluido.",
  category: "EQUIPO",
  department: "San Salvador",
  municipality: "San Salvador Centro",
  address: "Colonia Escalón, calle principal 123",
  pricePerDay: "25",
  securityDeposit: "",
};

function errorsFor(data: Record<string, unknown>) {
  const result = propertyFormSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

function fileOf(type: string, size: number) {
  const file = new File(["x"], "foto", { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("H1. Publicar una propiedad", () => {
  it("AC1: acepta un bien con todos sus datos válidos y el depósito vacío", () => {
    expect(errorsFor(validProperty)).toEqual([]);
  });

  it("AC1: no permite un nombre de más de 100 caracteres", () => {
    expect(errorsFor({ ...validProperty, title: "a".repeat(101) })).toContain(m.titleMax);
  });

  it("AC1: exige elegir la categoría", () => {
    expect(errorsFor({ ...validProperty, category: "" })).toContain(m.categoryRequired);
  });

  it("AC4: no permite publicar sin nombre", () => {
    expect(errorsFor({ ...validProperty, title: "   " })).toContain(m.titleRequired);
  });

  it("AC4: no permite una descripción de menos de 30 caracteres", () => {
    expect(errorsFor({ ...validProperty, description: "Muy corta" })).toContain(m.descriptionMin);
  });

  it("AC4: no permite un precio por día vacío, menor o igual a 0 o inválido", () => {
    expect(errorsFor({ ...validProperty, pricePerDay: "" })).toContain(m.priceRequired);
    expect(errorsFor({ ...validProperty, pricePerDay: "0" })).toContain(m.priceRange);
    expect(errorsFor({ ...validProperty, pricePerDay: "-5" })).toContain(m.priceInvalid);
  });

  it("AC2: exige entre 1 y 5 fotos", () => {
    expect(getPhotoCountError(0)).toBe(m.photosRequired);
    expect(getPhotoCountError(6)).toBe(m.photosMax);
    expect(getPhotoCountError(1)).toBeUndefined();
    expect(getPhotoCountError(5)).toBeUndefined();
  });

  it("AC2: solo acepta fotos JPG o PNG de máximo 5 MB", () => {
    expect(getPhotoFileError(fileOf("image/jpeg", 1024))).toBeUndefined();
    expect(getPhotoFileError(fileOf("image/png", PHOTO_MAX_BYTES))).toBeUndefined();
    expect(getPhotoFileError(fileOf("image/gif", 1024))).toBe(m.photoType);
    expect(getPhotoFileError(fileOf("image/png", PHOTO_MAX_BYTES + 1))).toBe(m.photoSize);
  });

  it("AC1: guarda los montos con 2 decimales y el depósito vacío como 0.00", () => {
    expect(toMoney("45")).toBe("45.00");
    expect(toMoney("45.5")).toBe("45.50");
    expect(toMoney("")).toBe("0.00");
  });
});