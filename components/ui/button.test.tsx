import type { MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renderiza variantes, tamaños, ancho completo e íconos", () => {
    render(
      <Button
        variant="outline"
        size="lg"
        fullWidth
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Guardar
      </Button>
    );

    const button = screen.getByRole("button", { name: /Guardar/i });
    expect(button.className).toContain("border");
    expect(button.className).toContain("h-12");
    expect(button.className).toContain("w-full");
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("ejecuta onClick cuando está habilitado y lo bloquea si está disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    const { rerender } = render(<Button onClick={onClick}>Acción</Button>);
    await user.click(screen.getByRole("button", { name: "Acción" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button disabled onClick={onClick}>
        Acción
      </Button>
    );
    const disabledBtn = screen.getByRole("button", { name: "Acción" });
    expect(disabledBtn).toBeDisabled();
    await user.click(disabledBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("muestra spinner, oculta íconos y deshabilita interacción cuando isLoading es true", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    const { container } = render(
      <Button
        isLoading
        onClick={onClick}
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Cargando
      </Button>
    );

    const button = screen.getByRole("button", { name: "Cargando" });
    expect(button).toBeDisabled();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("soporta modo asChild clonando el elemento hijo con clases y manejando click", async () => {
    const user = userEvent.setup();
    const childClick = jest.fn((e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
    });
    const buttonClick = jest.fn();

    const { rerender } = render(
      <Button asChild variant="ghost" onClick={buttonClick}>
        <a href="/destino" onClick={childClick} className="custom-link">
          Ir a destino
        </a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Ir a destino" });
    expect(link.className).toContain("custom-link");
    expect(link.className).toContain("bg-transparent");

    await user.click(link);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(buttonClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button asChild disabled onClick={buttonClick}>
        <a href="/destino" onClick={childClick}>
          Ir a destino
        </a>
      </Button>
    );
    await user.click(screen.getByRole("link", { name: "Ir a destino" }));
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(buttonClick).toHaveBeenCalledTimes(1);
  });
});
