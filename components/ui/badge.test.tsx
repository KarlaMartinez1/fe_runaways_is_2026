import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, type BadgeVariant, type BadgeSize } from "./badge";

describe("Badge", () => {
  it("renderiza el texto con clases por defecto", () => {
    render(<Badge>Disponible</Badge>);

    const badge = screen.getByText("Disponible");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("px-2.5");
  });

  it.each<[BadgeVariant, string]>([
    ["success", "bg-[#dcfce7]"],
    ["info", "bg-[#e0f2fe]"],
    ["warning", "bg-[#fef3c7]"],
    ["danger", "bg-[#fee2e2]"],
    ["neutral", "bg-gray-100"],
  ])("aplica estilos para la variante %s", (variant, expectedClass) => {
    render(<Badge variant={variant}>Estado</Badge>);
    expect(screen.getByText("Estado").className).toContain(expectedClass);
  });

  it.each<[BadgeSize, string]>([
    ["sm", "text-xs"],
    ["md", "px-3"],
  ])("aplica estilos para el tamaño %s", (size, expectedClass) => {
    render(<Badge size={size}>Tamaño</Badge>);
    expect(screen.getByText("Tamaño").className).toContain(expectedClass);
  });

  it("reenvía ref y combina className personalizada", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="extra-badge">
        Con ref
      </Badge>
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.className).toContain("extra-badge");
  });
});
