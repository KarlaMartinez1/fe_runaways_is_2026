import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { changePropertyStatus, deleteProperty } from "@/app/actions/property-status";
import type { OwnerProperty } from "@/lib/api/types";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { PropertyManager } from "./property-manager";

jest.mock("@/app/actions/property-status", () => ({
  changePropertyStatus: jest.fn(),
  deleteProperty: jest.fn(),
}));

jest.mock("@/app/actions/properties", () => ({
  createProperty: jest.fn(),
  updateProperty: jest.fn(),
}));

const mockedChangeStatus = changePropertyStatus as jest.MockedFunction<typeof changePropertyStatus>;
const mockedDelete = deleteProperty as jest.MockedFunction<typeof deleteProperty>;

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

describe("H5. Pausar, reactivar y eliminar una publicación", () => {
  beforeEach(() => {
    mockedChangeStatus.mockReset();
    mockedDelete.mockReset();
  });

  it("AC1: al pausar un bien disponible cambia a PAUSADO y el botón pasa a Reactivar", async () => {
    const user = userEvent.setup();
    mockedChangeStatus.mockResolvedValue({ ok: true, status: "PAUSADO" });
    render(<PropertyManager property={property} />);

    await user.click(screen.getByRole("button", { name: m.pause }));

    expect(mockedChangeStatus).toHaveBeenCalledWith("p-1", "PAUSADO");
    expect(await screen.findByRole("button", { name: m.reactivate })).toBeInTheDocument();
  });

  it("AC1: al reactivar un bien pausado vuelve a DISPONIBLE y el botón pasa a Pausar", async () => {
    const user = userEvent.setup();
    mockedChangeStatus.mockResolvedValue({ ok: true, status: "DISPONIBLE" });
    render(<PropertyManager property={{ ...property, status: "PAUSADO" }} />);

    await user.click(screen.getByRole("button", { name: m.reactivate }));

    expect(mockedChangeStatus).toHaveBeenCalledWith("p-1", "DISPONIBLE");
    expect(await screen.findByRole("button", { name: m.pause })).toBeInTheDocument();
  });

  it("AC2: muestra el error cuando el bien tiene reservas PENDIENTE o PAGADA y no cambia el estado", async () => {
    const user = userEvent.setup();
    mockedChangeStatus.mockResolvedValue({ ok: false, message: m.statusLocked });
    render(<PropertyManager property={property} />);

    await user.click(screen.getByRole("button", { name: m.pause }));

    expect(await screen.findByRole("alert")).toHaveTextContent(m.statusLocked);
    expect(screen.getByRole("button", { name: m.pause })).toBeInTheDocument();
  });

  it("AC3: al eliminar pide confirmación con el nombre del bien y permite cancelar", async () => {
    const user = userEvent.setup();
    render(<PropertyManager property={property} />);

    await user.click(screen.getByRole("button", { name: m.deleteProperty }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(m.deleteConfirm(property.title));

    await user.click(within(dialog).getByRole("button", { name: m.cancel }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("AC3: el diálogo de confirmación también se cierra con Escape", async () => {
    const user = userEvent.setup();
    render(<PropertyManager property={property} />);

    await user.click(screen.getByRole("button", { name: m.deleteProperty }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("AC3: al confirmar se envía la eliminación del bien", async () => {
    const user = userEvent.setup();
    mockedDelete.mockResolvedValue({ ok: false, message: m.statusLocked });
    render(<PropertyManager property={property} />);

    await user.click(screen.getByRole("button", { name: m.deleteProperty }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: m.deleteConfirmButton }));

    expect(mockedDelete).toHaveBeenCalledWith("p-1");
  });

  it("AC2: si el bien tiene reservas activas no se elimina y se muestra el error", async () => {
    const user = userEvent.setup();
    mockedDelete.mockResolvedValue({ ok: false, message: m.statusLocked });
    render(<PropertyManager property={property} />);

    await user.click(screen.getByRole("button", { name: m.deleteProperty }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: m.deleteConfirmButton }));

    expect(await screen.findByRole("alert")).toHaveTextContent(m.statusLocked);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});