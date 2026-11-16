import { cn } from "@/lib/utils/cn";

type CharacterCounterProps = {
  length: number;
  max: number;
};

export function CharacterCounter({ length, max }: CharacterCounterProps) {
  const exceeded = length > max;
  return (
    <span
      aria-live="polite"
      className={cn(
        "text-xs tabular-nums",
        exceeded ? "font-semibold text-red-600" : "text-[#5b6270]",
      )}
    >
      {length}/{max}
    </span>
  );
}