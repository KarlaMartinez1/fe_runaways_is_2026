import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { detailMessages, galleryMessages } from "@/lib/messages/properties";
import { PropertyGallery } from "./property-gallery";

const title = "Apartamento céntrico";
const images = [
  "https://example.com/portada.jpg",
  "https://example.com/sala.jpg",
  "https://example.com/cocina.jpg",
];

describe("H3. Detalle de un bien", () => {
  it("AC1: muestra la primera foto como portada", () => {
    render(<PropertyGallery images={images} title={title} />);

    const photo = screen.getByRole("img", { name: galleryMessages.photoAlt(title, 1, 3) });
    expect(photo).toHaveAttribute("src", images[0]);
  });

  it("AC1: permite recorrer todas las fotos con Siguiente y Anterior", async () => {
    const user = userEvent.setup();
    render(<PropertyGallery images={images} title={title} />);

    await user.click(screen.getByRole("button", { name: galleryMessages.next }));
    expect(screen.getByRole("img")).toHaveAttribute("src", images[1]);

    await user.click(screen.getByRole("button", { name: galleryMessages.previous }));
    await user.click(screen.getByRole("button", { name: galleryMessages.previous }));
    expect(screen.getByRole("img")).toHaveAttribute("src", images[2]);
  });

  it("AC1: permite ir directo a una foto con los indicadores", async () => {
    const user = userEvent.setup();
    render(<PropertyGallery images={images} title={title} />);

    const third = screen.getByRole("button", { name: galleryMessages.goTo(3) });
    await user.click(third);

    expect(screen.getByRole("img")).toHaveAttribute("src", images[2]);
    expect(third).toHaveAttribute("aria-current", "true");
  });

  it("AC1: con una sola foto no muestra los botones para cambiar de foto", () => {
    render(<PropertyGallery images={[images[0]]} title={title} />);

    expect(screen.getByRole("img")).toHaveAttribute("src", images[0]);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("AC2: muestra la calificación con un decimal y la cantidad de reseñas", () => {
    expect(detailMessages.rating(4.46, 12)).toBe("★ 4.5 (12 reseñas)");
    expect(detailMessages.rating(5, 1)).toBe("★ 5.0 (1 reseña)");
    expect(detailMessages.noRatings).toBe("Sin calificaciones");
  });
});