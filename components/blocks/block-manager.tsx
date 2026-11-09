"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createBlockAction, deleteBlockAction } from "@/app/actions/blocks";
import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { Button, Card } from "@/components/ui";
import type { NoAvailabilityBlock } from "@/lib/api/types";
import { validateBlockRange } from "@/lib/blocks/rules";
import { formatShortDate, formatShortRange } from "@/lib/bookings/format";
import { blockMessages } from "@/lib/messages/blocks";
import { rangeOverlapsOccupied as overlaps } from "@/lib/bookings/rules";

type BlockManagerProps = {
  propertyId: string;
  from: string;
  to: string;
  occupiedDates: string[];
  blocks: NoAvailabilityBlock[];
};

type Feedback = { type: "success" | "error"; message: string };

export function BlockManager({ propertyId, from, to, occupiedDates, blocks }: BlockManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const resetSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleSelectDate = (iso: string) => {
    setFeedback(null);

    if (!startDate || endDate || iso < startDate) {
      setStartDate(iso);
      setEndDate(null);
      return;
    }

    if (overlaps(startDate, iso, occupiedDates)) {
      setFeedback({ type: "error", message: blockMessages.conflict });
      setStartDate(iso);
      setEndDate(null);
      return;
    }

    setEndDate(iso);
  };

  const handleBlock = () => {
    if (!startDate || !endDate || isPending) return;

    const validation = validateBlockRange(startDate, endDate);
    if (validation) {
      setFeedback({ type: "error", message: validation });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result = await createBlockAction(propertyId, { startDate, endDate });

      if (result.ok) {
        resetSelection();
        setFeedback({ type: "success", message: result.message });
        router.refresh();
        return;
      }

      if (result.sessionExpired) {
        router.push("/login");
        return;
      }

      setFeedback({ type: "error", message: result.message });
      router.refresh();
    });
  };

  const handleDelete = (block: NoAvailabilityBlock) => {
    if (isPending) return;

    setFeedback(null);
    startTransition(async () => {
      const result = await deleteBlockAction(propertyId, block.id);
      setConfirmingId(null);

      if (result.ok) {
        setFeedback({ type: "success", message: result.message });
        router.refresh();
        return;
      }

      if (result.sessionExpired) {
        router.push("/login");
        return;
      }

      setFeedback({ type: "error", message: result.message });
      router.refresh();
    });
  };

  const selectionText =
    startDate && endDate
      ? formatShortRange(startDate, endDate)
      : startDate
        ? blockMessages.pickEnd(formatShortDate(startDate))
        : blockMessages.selectDates;

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <Card padding="md" className="flex flex-col gap-4">
        <AvailabilityCalendar
          from={from}
          to={to}
          occupiedDates={occupiedDates}
          selectedStart={startDate}
          selectedEnd={endDate}
          onSelectDate={handleSelectDate}
          selectionLabel="Nuevo bloqueo"
        />

        <p className="text-sm text-zinc-700">{selectionText}</p>

        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={feedback.type === "error" ? "text-sm text-red-700" : "text-sm text-green-700"}
          >
            {feedback.message}
          </p>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!startDate || !endDate}
          isLoading={isPending}
          onClick={handleBlock}
        >
          {blockMessages.submit}
        </Button>
      </Card>

      <section aria-labelledby="blocks-title" className="flex flex-col gap-4">
        <h2 id="blocks-title" className="text-xl font-bold text-zinc-900">
          {blockMessages.listTitle}
        </h2>

        {blocks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600">
            {blockMessages.empty}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">{blockMessages.columnStart}</th>
                  <th scope="col" className="py-2 pr-4 font-medium">{blockMessages.columnEnd}</th>
                  <th scope="col" className="py-2 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 text-zinc-900">{formatShortDate(block.startDate)}</td>
                    <td className="py-3 pr-4 text-zinc-900">{formatShortDate(block.endDate)}</td>
                    <td className="py-3">
                      {confirmingId === block.id ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-right text-zinc-700">
                            {blockMessages.confirmPrompt(formatShortRange(block.startDate, block.endDate))}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)} disabled={isPending}>
                              {blockMessages.cancelRemove}
                            </Button>
                            <Button size="sm" isLoading={isPending} onClick={() => handleDelete(block)}>
                              {blockMessages.confirmRemove}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setConfirmingId(block.id)}
                          >
                            {blockMessages.remove}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
