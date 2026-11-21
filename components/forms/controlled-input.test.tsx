import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { ControlledInput } from "./controlled-input";

interface TestFormValues {
  username: string;
}

function ControlledInputHarness({
  externalError,
}: {
  externalError?: string;
}) {
  const { control, handleSubmit } = useForm<TestFormValues>({
    defaultValues: { username: "" },
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <ControlledInput
        name="username"
        control={control}
        label="Usuario"
        error={externalError}
      />
      <button type="submit">Enviar</button>
    </form>
  );
}

function ControlledInputValidationHarness() {
  const { control, setError, handleSubmit } = useForm<TestFormValues>({
    defaultValues: { username: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (!values.username) {
          setError("username", { type: "manual", message: "El usuario es obligatorio" });
        }
      })}
    >
      <ControlledInput name="username" control={control} label="Usuario" />
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("ControlledInput", () => {
  it("actualiza el valor controlado al escribir", async () => {
    const user = userEvent.setup();
    render(<ControlledInputHarness />);

    const input = screen.getByLabelText("Usuario") as HTMLInputElement;
    await user.type(input, "karina");

    expect(input.value).toBe("karina");
  });

  it("muestra el error proveniente de react-hook-form", async () => {
    const user = userEvent.setup();
    render(<ControlledInputValidationHarness />);

    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("El usuario es obligatorio")).toBeInTheDocument();
    expect(screen.getByLabelText("Usuario")).toHaveAttribute("aria-invalid", "true");
  });

  it("prioriza el prop error explícito sobre el estado del campo", () => {
    render(<ControlledInputHarness externalError="Error externo" />);

    expect(screen.getByText("Error externo")).toBeInTheDocument();
    expect(screen.getByLabelText("Usuario")).toHaveAttribute("aria-invalid", "true");
  });
});
