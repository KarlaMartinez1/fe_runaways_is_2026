import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NativeSelect, Select, type SelectOption } from "./select";

const sampleOptions: SelectOption<string>[] = [
  { value: "desc", label: "Mayor a menor" },
  { value: "disabled_opt", label: "Opción bloqueada", disabled: true },
  { value: "asc", label: "Menor a mayor" },
];

describe("Select", () => {
  it("renderiza etiqueta, placeholder, ícono izquierdo e input oculto en modo no controlado", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { container } = render(
      <Select
        id="sort-select"
        name="sortOrder"
        label="Ordenar por"
        placeholder="Elige orden"
        options={sampleOptions}
        onChange={onChange}
        leftIcon={<span data-testid="left-icon">*</span>}
        helperText="Selecciona el orden deseado"
      />
    );

    const combobox = screen.getByRole("combobox", { name: "Ordenar por" });
    expect(combobox).toHaveTextContent("Elige orden");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByText("Selecciona el orden deseado")).toBeInTheDocument();

    const hiddenInput = container.querySelector(
      'input[type="hidden"][name="sortOrder"]'
    ) as HTMLInputElement;
    expect(hiddenInput.value).toBe("");

    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Opción deshabilitada no debe seleccionar
    await user.click(screen.getByRole("option", { name: "Opción bloqueada" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Opción habilitada selecciona y cierra
    await user.click(screen.getByRole("option", { name: "Menor a mayor" }));
    expect(onChange).toHaveBeenCalledWith("asc");
    expect(combobox).toHaveTextContent("Menor a mayor");
    expect(hiddenInput.value).toBe("asc");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("soporta navegación por teclado (ArrowDown, ArrowUp, Enter, Space, Escape, Tab) y clic externo", () => {
    const onChange = jest.fn();

    render(
      <div>
        <div data-testid="outside">Afuera</div>
        <Select
          aria-label="Orden"
          options={sampleOptions}
          defaultValue="desc"
          onChange={onChange}
        />
      </div>
    );

    const combobox = screen.getByRole("combobox", { name: "Orden" });
    expect(combobox).toHaveTextContent("Mayor a menor");

    // Abrir con ArrowDown, saltar opción deshabilitada hacia 'asc' y confirmar con Enter
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("asc");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Abrir con Space, subir con ArrowUp saltando opción deshabilitada y cerrar con Escape
    fireEvent.keyDown(combobox, { key: " " });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(combobox, { key: "ArrowUp" });
    fireEvent.keyDown(combobox, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);

    // Abrir y cerrar con Tab, y luego con clic externo
    fireEvent.keyDown(combobox, { key: "ArrowUp" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(combobox, { key: "Tab" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(combobox);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("muestra error string o FieldError, soporta value controlado y estado disabled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Select
        id="controlled-select"
        label="Estado"
        value="desc"
        options={sampleOptions}
        error="Error obligatorio"
        selectSize="sm"
      />
    );

    const combobox = screen.getByRole("combobox", { name: "Estado" });
    expect(combobox).toHaveAttribute("aria-invalid", "true");
    expect(combobox.className).toContain("h-9");
    expect(screen.getByText("Error obligatorio")).toBeInTheDocument();

    rerender(
      <Select
        id="controlled-select"
        label="Estado"
        value="desc"
        options={sampleOptions}
        error={{ type: "manual", message: "Error RHF" }}
        disabled
        selectSize="lg"
      />
    );

    expect(screen.getByText("Error RHF")).toBeInTheDocument();
    expect(combobox).toBeDisabled();
    expect(combobox.className).toContain("h-12");

    await user.click(combobox);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("NativeSelect", () => {
  it("renderiza opciones nativas, dispara onChange, maneja error, helperText y ref", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const ref = React.createRef<HTMLSelectElement>();

    const { rerender } = render(
      <NativeSelect
        ref={ref}
        id="native-sel"
        label="Categoría"
        helperText="Elige una categoría"
        onChange={onChange}
      >
        <option value="PROPIEDAD">Propiedad</option>
        <option value="EQUIPO">Equipo</option>
      </NativeSelect>
    );

    const select = screen.getByLabelText("Categoría") as HTMLSelectElement;
    expect(ref.current).toBe(select);
    expect(screen.getByText("Elige una categoría")).toBeInTheDocument();

    await user.selectOptions(select, "EQUIPO");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select.value).toBe("EQUIPO");

    rerender(
      <NativeSelect
        ref={ref}
        id="native-sel"
        label="Categoría"
        error={{ type: "required", message: "Debes elegir una opción" }}
        disabled
      >
        <option value="PROPIEDAD">Propiedad</option>
      </NativeSelect>
    );

    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toBeDisabled();
    expect(screen.getByText("Debes elegir una opción")).toBeInTheDocument();
  });
});
