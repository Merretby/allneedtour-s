import { useEffect, useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import type { Product } from "@/lib/api/types";
import { formatPrice, toNumber } from "@/lib/format";

interface PriceFilterProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

const PriceFilter = ({ products, onChange }: PriceFilterProps) => {
  const bounds = useMemo(() => {
    const prices = products.map((product) => toNumber(product.price)).filter(Number.isFinite);
    if (prices.length === 0) return { min: 0, max: 1 };

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);
  const [range, setRange] = useState<[number, number]>([bounds.min, bounds.max]);

  useEffect(() => {
    setRange([bounds.min, bounds.max]);
  }, [bounds.min, bounds.max]);

  useEffect(() => {
    onChange(
      products.filter((product) => {
        const price = toNumber(product.price);
        return price >= range[0] && price <= range[1];
      })
    );
  }, [onChange, products, range]);

  const isDefault = range[0] === bounds.min && range[1] === bounds.max;

  return (
    <section className="mb-8 max-w-sm rounded-lg bg-card px-1 py-2">
      <p className="mb-3 text-sm font-semibold">Filtrer par prix :</p>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={1}
        value={range}
        onValueChange={(value) => {
          if (value.length === 2) setRange([value[0], value[1]]);
        }}
        aria-label="Filtrer par prix"
        className="mb-3"
      />
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>
          {formatPrice(range[0])} - {formatPrice(range[1])}
        </span>
        <button
          type="button"
          onClick={() => setRange([bounds.min, bounds.max])}
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
