import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import type { Property } from "@/lib/api/types";
import { categoryLabels, propertyMessages } from "@/lib/messages/properties";
import { PropertyCard } from "./property-card";

const property: Property = {
  id: "p-1",
  title: "Cámara Canon EOS",
  category: "EQUIPO",
  department: "La Libertad",
  municipality: "Santa Tecla",
  pricePerDay: "45",
  images: ["https://example.com/portada.jpg", "https://example.com/segunda.jpg"],
  status: "DISPONIBLE",
  createdAt: "2026-11-20T10:00:00.000Z",
};

describe("H2. Catálogo de bienes en renta", () => {
  it("AC1: la tarjeta muestra la foto de portada, el nombre, el municipio y departamento y la categoría", () => {
    render(<PropertyCard property={property} />);

    const cover = screen.getByRole("img", { name: property.title });
    expect(cover).toHaveAttribute("src", property.images[0]);
    expect(screen.getByText(property.title)).toBeInTheDocument();
    expect(screen.getByText("Santa Tecla, La Libertad")).toBeInTheDocument();
    expect(screen.getByText(categoryLabels.EQUIPO)).toBeInTheDocument();
  });

  it("AC1: muestra el precio por día con 2 decimales", () => {
    render(<PropertyCard property={property} />);

    expect(screen.getByText(`$45.00 ${propertyMessages.perDay}`)).toBeInTheDocument();
  });

  it("AC1: al seleccionar la tarjeta se abre el detalle del bien", () => {
    render(<PropertyCard property={property} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/properties/p-1");
  });

  it("AC1: muestra un espacio de imagen cuando el bien no tiene fotos", () => {
    render(<PropertyCard property={{ ...property, images: [] }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(property.title)).toBeInTheDocument();
  });

  it("AC1: no muestra la etiqueta de estado en el catálogo", () => {
    render(<PropertyCard property={property} />);

    expect(screen.queryByText("Disponible")).not.toBeInTheDocument();
  });
});