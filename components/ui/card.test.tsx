import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

describe("Card", () => {
  it("renderiza la composición completa de tarjeta con sus subcomponentes", () => {
    const cardRef = React.createRef<HTMLDivElement>();

    render(
      <Card ref={cardRef} padding="lg" variant="bordered" className="custom-card">
        <CardHeader>
          <div>
            <CardTitle as="h3">Título de tarjeta</CardTitle>
            <CardDescription>Descripción secundaria</CardDescription>
          </div>
        </CardHeader>
        <CardContent>Contenido principal</CardContent>
        <CardFooter>Pie de tarjeta</CardFooter>
      </Card>
    );

    expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
    expect(cardRef.current?.className).toContain("custom-card");
    expect(cardRef.current?.className).toContain("bg-transparent");
    expect(cardRef.current?.className).toContain("sm:p-8");
    expect(
      screen.getByRole("heading", { level: 3, name: "Título de tarjeta" })
    ).toBeInTheDocument();
    expect(screen.getByText("Descripción secundaria")).toBeInTheDocument();
    expect(screen.getByText("Contenido principal")).toBeInTheDocument();
    expect(screen.getByText("Pie de tarjeta")).toBeInTheDocument();
  });

  it("aplica variantes flat y paddings none/sm correctamente", () => {
    const { container, rerender } = render(
      <Card variant="flat" padding="none">
        Sin padding
      </Card>
    );

    expect(container.firstChild).toHaveClass("bg-gray-50/80", "p-0");

    rerender(
      <Card variant="default" padding="sm">
        Padding pequeño
      </Card>
    );
    expect(container.firstChild).toHaveClass("bg-white", "p-3.5");
  });
});
