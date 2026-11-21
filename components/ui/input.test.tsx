import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("asocia etiqueta, permite escribir y muestra texto de ayuda", async () => {
    const user = userEvent.setup();
    render(
      <Input
        id="monto-input"
        label="Monto"
        helperText="Ingresa el valor en USD"
        placeholder="0.00"
        prefix={<span>$</span>}
        suffix={<span>USD</span>}
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      />
    );

    const input = screen.getByLabelText("Monto") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-describedby", "monto-input-helper");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();

    await user.type(input, "45.00");
    expect(input.value).toBe("45.00");
  });

  it("muestra error string o FieldError priorizando sobre helperText", () => {
    const { rerender } = render(
      <Input
        id="campo"
        label="Campo"
        helperText="Ayuda oculta"
        error="Este campo es requerido"
      />
    );

    const input = screen.getByLabelText("Campo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "campo-error");
    expect(screen.getByText("Este campo es requerido")).toBeInTheDocument();
    expect(screen.queryByText("Ayuda oculta")).not.toBeInTheDocument();

    rerender(
      <Input
        id="campo"
        label="Campo"
        error={{ type: "manual", message: "Error de RHF" }}
        inputSize="lg"
        disabled
      />
    );

    expect(screen.getByText("Error de RHF")).toBeInTheDocument();
    expect(screen.getByLabelText("Campo")).toBeDisabled();
    expect(screen.getByLabelText("Campo").className).toContain("h-12");
  });

  it("reenvía ref al elemento input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Con ref" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
