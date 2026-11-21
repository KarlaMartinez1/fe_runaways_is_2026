import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { updateProperty } from "@/app/actions/properties";
import type { OwnerProperty } from "@/lib/api/types";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { PropertyForm } from "./property-form";

jest.mock("@/app/actions/properties", () => ({
  createProperty: jest.fn(),
  updateProperty: jest.fn(),
}));

const mockedUpdate = updateProperty as jest.MockedFunction<typeof updateProperty>;

const property: OwnerProperty = {
  id: "p-1",
  title: "Cámara Canon EOS",
  description: "Cámara en excelente estado con lente de 50 mm incluido.",
  category: "EQUIPO",
  department: "San Salvador",
  municipality: "San Salvador Centro",
  address: "Colonia Escalón, calle principal 123",
  pricePerDay: "25.00",
  securityDeposit: "20.00",
  images: ["https://example.com/portada.jpg"],
  status: "DISPONIBLE",
  createdAt: "2026-11-20T10:00:00.000Z",
  ownerName: "Emely Chavez",
  reviewCount: 0,
};

function titleInput() {
  return screen.getByLabelText(new RegExp(m.titleLabel));
}

describe("H4. Mis publicaciones y edición", () => {
  beforeEach(() => {
    mockedUpdate.mockReset();
  });

  it("AC2: la pantalla de gestión abre en modo de solo lectura con los datos del bien", () => {
    render(<PropertyForm property={property} />);

    expect(titleInput()).toHaveValue(property.title);
    expect(titleInput()).toBeDisabled();
    expect(screen.getByRole("button", { name: m.edit })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: m.save })).not.toBeInTheDocument();
  });

  it("AC2: al presionar Editar los campos pasan a ser editables en la misma pantalla", async () => {
    const user = userEvent.setup();
    render(<PropertyForm property={property} />);

    await user.click(screen.getByRole("button", { name: m.edit }));

    expect(titleInput()).toBeEnabled();
    expect(screen.getByRole("button", { name: m.save })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: m.cancel })).toBeInTheDocument();
  });

  it("AC2: al cancelar se descartan los cambios y vuelve a solo lectura con los datos anteriores", async () => {
    const user = userEvent.setup();
    render(<PropertyForm property={property} />);

    await user.click(screen.getByRole("button", { name: m.edit }));
    await user.clear(titleInput());
    await user.type(titleInput(), "Nombre que no se guarda");
    await user.click(screen.getByRole("button", { name: m.cancel }));

    expect(titleInput()).toHaveValue(property.title);
    expect(titleInput()).toBeDisabled();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("AC2: al guardar muestra 'Cambios guardados' y vuelve a solo lectura con los datos nuevos", async () => {
    const user = userEvent.setup();
    mockedUpdate.mockResolvedValue({ ok: true, images: property.images });
    render(<PropertyForm property={property} />);

    await user.click(screen.getByRole("button", { name: m.edit }));
    await user.clear(titleInput());
    await user.type(titleInput(), "Cámara Canon EOS R");
    await user.click(screen.getByRole("button", { name: m.save }));

    expect(await screen.findByRole("status")).toHaveTextContent(m.saved);
    expect(titleInput()).toHaveValue("Cámara Canon EOS R");
    expect(titleInput()).toBeDisabled();
    expect(mockedUpdate).toHaveBeenCalledWith(
      "p-1",
      expect.objectContaining({ title: "Cámara Canon EOS R" }),
      property.images,
      [],
      expect.any(FormData),
    );
  });

  it("AC3: muestra el error cuando no se puede modificar el precio o el depósito por reservas activas", async () => {
    const user = userEvent.setup();
    mockedUpdate.mockResolvedValue({ ok: false, message: m.moneyLocked });
    render(<PropertyForm property={property} />);

    await user.click(screen.getByRole("button", { name: m.edit }));
    await user.click(screen.getByRole("button", { name: m.save }));

    expect(await screen.findByRole("alert")).toHaveTextContent(m.moneyLocked);
    expect(titleInput()).toBeEnabled();
  });
});