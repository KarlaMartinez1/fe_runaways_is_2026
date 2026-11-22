import { redirect } from "next/navigation";
import RatePropertyPage from "./page";
import { bookingRepository, profileRepository } from "@/lib/repositories";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
}));

jest.mock("@/components/layout/navbar", () => ({ Navbar: () => null }));
jest.mock("@/components/reviews/rate-property-body", () => ({ RatePropertyBody: () => null }));
jest.mock("@/lib/repositories", () => ({
  profileRepository: { getUserProfile: jest.fn() },
  bookingRepository: { listMine: jest.fn() },
  propertyRepository: { getById: jest.fn() },
}));

describe("Historia 17: acceso a calificar mi reserva", () => {
  beforeEach(() => jest.clearAllMocks());

  it("AC5: impide que una cuenta OWNER use la pantalla de calificación", async () => {
    (profileRepository.getUserProfile as jest.Mock).mockResolvedValue({ role: "OWNER" });

    await expect(
      RatePropertyPage({ params: Promise.resolve({ id: "reservation-1" }) }),
    ).rejects.toThrow("REDIRECT:/access-denied");

    expect(redirect).toHaveBeenCalledWith("/access-denied");
    expect(bookingRepository.listMine).not.toHaveBeenCalled();
  });
});
