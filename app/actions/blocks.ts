"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import { validateBlockRange } from "@/lib/blocks/rules";
import { blockMessages } from "@/lib/messages/blocks";
import { blockRepository } from "@/lib/repositories";

export type BlockActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; sessionExpired?: boolean };

function mapError(error: unknown): BlockActionResult {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return { ok: false, message: blockMessages.sessionExpired, sessionExpired: true };
    }
    if (error.status === 403) {
      return { ok: false, message: blockMessages.forbidden };
    }
    if (error.status === 404) {
      return { ok: false, message: blockMessages.notAvailable };
    }
    if (error.status === 409) {
      return { ok: false, message: blockMessages.conflict };
    }
    if (error.status === 400 && error.message) {
      return { ok: false, message: error.message };
    }
  }

  console.error("Error en bloqueos:", error);
  return { ok: false, message: blockMessages.saveError };
}

function revalidateAvailability(propertyId: string) {
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}/availability`);
}

export async function createBlockAction(
  propertyId: string,
  input: { startDate: string; endDate: string },
): Promise<BlockActionResult> {
  const rangeError = validateBlockRange(input.startDate, input.endDate);
  if (rangeError) {
    return { ok: false, message: rangeError };
  }

  try {
    await blockRepository.create(propertyId, input);
    revalidateAvailability(propertyId);
    return { ok: true, message: blockMessages.created };
  } catch (error) {
    return mapError(error);
  }
}

export async function deleteBlockAction(propertyId: string, blockId: string): Promise<BlockActionResult> {
  try {
    await blockRepository.remove(blockId);
    revalidateAvailability(propertyId);
    return { ok: true, message: blockMessages.deleted };
  } catch (error) {
    return mapError(error);
  }
}