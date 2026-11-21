import { render, screen } from "@testing-library/react";
import { RegisterForm } from "./register-form";

describe("H28. Formulario de registro", () => {
  it("solo solicita name, email y password", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Nombre")).toHaveAttribute("name", "name");
    expect(screen.getByLabelText(/correo/i)).toHaveAttribute("name", "email");
    const password = screen.getByLabelText("Contraseña", { exact: true });
    expect(password).toHaveAttribute("name", "password");
    expect(password).toHaveAttribute("minlength", "8");
    expect(screen.getByRole("button", { name: "Registrarse" })).toBeEnabled();
    expect(screen.queryByLabelText(/rol|apellido|teléfono/i)).not.toBeInTheDocument();
  });
});
