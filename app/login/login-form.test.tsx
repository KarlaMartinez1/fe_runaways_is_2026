import { render, screen } from "@testing-library/react";
import { LoginForm } from "./login-form";

describe("H28. Formulario de inicio de sesión", () => {
  it("solicita correo y contraseña con los tipos adecuados", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/correo/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Contraseña", { exact: true })).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: /iniciar sesi/i })).toBeEnabled();
  });
});
