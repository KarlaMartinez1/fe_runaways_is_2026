import { ApiError } from "@/lib/api/client";
import type { NoAvailabilityBlock } from "@/lib/api/types";
import { validateBlockRange } from "@/lib/blocks/rules";
import { rangeOverlapsOccupied } from "@/lib/bookings/rules";
import { blockMessages } from "@/lib/messages/blocks";
import type { BlockRepository, CreateBlockInput } from "../block-repository";
import { blocksStore, type StoredBlock } from "./block-store";
import { getMockBookedDates } from "./booking-repository.mock";
import { propertyFixtures } from "./fixtures/properties";

// Simula la regla del backend: solo ARRENDADOR dueño del bien.
// MOCK_ROLE: rol de la sesión simulada (por defecto ARRENDADOR).
// MOCK_OWNED_PROPERTY_IDS: ids separados por coma de los bienes propios (por defecto todos).
function assertOwnerAccess(propertyId: string) {
  const role = process.env.MOCK_ROLE ?? "ARRENDADOR";
  if (role !== "ARRENDADOR") {
    throw new ApiError(403, "FORBIDDEN", blockMessages.forbidden);
  }

  const ownedEnv = process.env.MOCK_OWNED_PROPERTY_IDS;
  const owned = ownedEnv
    ? ownedEnv.split(",").map((value) => value.trim())
    : propertyFixtures.map((item) => item.id);

  if (!owned.includes(propertyId)) {
    throw new ApiError(404, "NOT_FOUND", blockMessages.notAvailable);
  }
}

function toBlock(block: StoredBlock): NoAvailabilityBlock {
  return {
    id: block.id,
    propertyId: block.propertyId,
    startDate: block.startDate,
    endDate: block.endDate,
    createdAt: block.createdAt,
  };
}

export const mockBlockRepository: BlockRepository = {
  async listByProperty(propertyId) {
    assertOwnerAccess(propertyId);
    return blocksStore
      .filter((block) => block.propertyId === propertyId)
      .map(toBlock);
  },

  async create(propertyId, input: CreateBlockInput) {
    assertOwnerAccess(propertyId);

    const rangeError = validateBlockRange(input.startDate, input.endDate);
    if (rangeError) {
      throw new ApiError(400, "VALIDATION_ERROR", rangeError);
    }

    const bookedDates = getMockBookedDates(propertyId);
    if (rangeOverlapsOccupied(input.startDate, input.endDate, bookedDates)) {
      throw new ApiError(409, "BLOCK_CONFLICT", blockMessages.conflict);
    }

    const overlapsBlock = blocksStore.some(
      (block) =>
        block.propertyId === propertyId &&
        input.startDate <= block.endDate &&
        input.endDate >= block.startDate,
    );
    if (overlapsBlock) {
      throw new ApiError(409, "BLOCK_CONFLICT", blockMessages.conflict);
    }

    const block: StoredBlock = {
      id: crypto.randomUUID(),
      propertyId,
      startDate: input.startDate,
      endDate: input.endDate,
      createdAt: new Date().toISOString(),
    };
    blocksStore.push(block);
    return toBlock(block);
  },

  async remove(blockId) {
    const index = blocksStore.findIndex((block) => block.id === blockId);
    if (index === -1) {
      throw new ApiError(404, "NOT_FOUND", blockMessages.notAvailable);
    }

    assertOwnerAccess(blocksStore[index].propertyId);
    blocksStore.splice(index, 1);
  },
};