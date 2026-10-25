import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";

interface PriceFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const PriceFilter = ({ min, max, value, onChange }: PriceFilterProps) => {
  const [draftRange, setDraftRange] = useState<[number, number]>(value);

  useEffect(() => {
    setDraftRange(value);
  }, [value]);

  const isDefault = draftRange[0] === min && draftRange[1] === max;

  return (
    <section className="mb-8 max-w-sm rounded-lg bg-card px-1 py-2">
      <p className="mb-3 text-sm font-semibold">Filtrer par prix :</p>
      <Slider
        min={min}
        max={Math.max(min, max)}
        step={1}
        value={draftRange}
        onValueChange={(nextValue) => {
          if (nextValue.length === 2) {
            setDraftRange([nextValue[0], nextValue[1]]);
          }
        }}
        onValueCommit={(nextValue) => {
          if (nextValue.length === 2) {
            onChange([nextValue[0], nextValue[1]]);
          }
        }}
        aria-label="Filtrer par prix"
        className="mb-3"
      />
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>
          {formatPrice(draftRange[0])} - {formatPrice(draftRange[1])}
        </span>
        <button
          type="button"
          onClick={() => {
            setDraftRange([min, max]);
            onChange([min, max]);
          }}
          disabled={isDefault}
          className="rounded-md bg-secondary px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary/80 disabled:cursor-default disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </section>
  );
};

export default PriceFilter;
