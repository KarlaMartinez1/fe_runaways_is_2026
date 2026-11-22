import { blocksStore } from "./block-store";
import { mockBlockRepository } from "./block-repository.mock";

describe("H12 AC6: permisos para administrar bloqueos", () => {
  it("rechaza crear o eliminar con otro rol y también bloqueos de bienes ajenos", async () => {
    const previousRole = process.env.MOCK_ROLE;
    const previousOwned = process.env.MOCK_OWNED_PROPERTY_IDS;
    const seeded = {
      id: "h12-access-test",
      propertyId: "p-02",
      startDate: "2026-11-25",
      endDate: "2026-11-26",
      createdAt: "2026-11-22T12:00:00.000Z",
    };
    blocksStore.push(seeded);

    try {
      process.env.MOCK_ROLE = "TENANT";
      process.env.MOCK_OWNED_PROPERTY_IDS = "p-01";
      await expect(
        mockBlockRepository.create("p-01", { startDate: "2026-11-27", endDate: "2026-11-28" }),
      ).rejects.toMatchObject({ status: 403 });
      await expect(mockBlockRepository.remove(seeded.id)).rejects.toMatchObject({ status: 403 });

      process.env.MOCK_ROLE = "ARRENDADOR";
      await expect(
        mockBlockRepository.create("p-02", { startDate: "2026-11-27", endDate: "2026-11-28" }),
      ).rejects.toMatchObject({ status: 404 });
      await expect(mockBlockRepository.remove(seeded.id)).rejects.toMatchObject({ status: 404 });
    } finally {
      const index = blocksStore.findIndex((block) => block.id === seeded.id);
      if (index >= 0) blocksStore.splice(index, 1);
      if (previousRole === undefined) delete process.env.MOCK_ROLE;
      else process.env.MOCK_ROLE = previousRole;
      if (previousOwned === undefined) delete process.env.MOCK_OWNED_PROPERTY_IDS;
      else process.env.MOCK_OWNED_PROPERTY_IDS = previousOwned;
    }
  });
});
