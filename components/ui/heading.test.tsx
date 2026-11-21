import { render, screen } from "@testing-library/react";
import { Heading } from "./heading";

describe("Heading", () => {
  it("renderiza el nivel de encabezado por defecto h1 sin subtítulo", () => {
    render(<Heading>Título principal</Heading>);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Título principal",
    });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain("text-3xl");
    expect(heading.className).toContain("text-left");
  });

  it("renderiza nivel personalizado, alineación, tamaño y subtítulo", () => {
    render(
      <Heading
        as="h3"
        size="sm"
        align="center"
        subtitle="Texto descriptivo"
        subtitleClassName="custom-subtitle"
      >
        Subsección
      </Heading>
    );

    const heading = screen.getByRole("heading", {
      level: 3,
      name: "Subsección",
    });
    expect(heading.className).toContain("text-base");
    expect(heading.className).toContain("text-center");

    const subtitle = screen.getByText("Texto descriptivo");
    expect(subtitle).toBeInTheDocument();
    expect(subtitle.className).toContain("custom-subtitle");
  });
});
