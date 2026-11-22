import { Check } from "lucide-react";

import { brandPhoto } from "@/components/dropnest/itemPhotos";
import { useDropnest } from "@/components/dropnest/store";
import { cn } from "@/lib/utils";
import { formatINR, itemBrandOptions, selectedBrand } from "@/lib/dropnest";

/**
 * Brand choices for one item, each with its own photo and price. The first
 * brand comes with the kit; others show what they add per unit.
 */
export function BrandPicker({
  itemId,
  itemName,
  baseLabel = "Included",
}: {
  itemId: string;
  itemName: string;
  /** Label for the first (₹0 extra) brand, e.g. "Included" in a kit or "Base" for add-ons. */
  baseLabel?: string;
}) {
  const { cart, setBrand } = useDropnest();
  const options = itemBrandOptions(itemId);
  if (options.length < 2) return null;
  const picked = selectedBrand(cart, itemId);
  return (
    <div className="mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Choose brand
      </p>
      <div
        role="radiogroup"
        aria-label={`Brand for ${itemName}`}
        className="mt-1.5 grid grid-cols-3 gap-1.5"
      >
        {options.map((o, i) => {
          const on = picked?.id === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${o.name}, ${i === 0 ? baseLabel : `+${formatINR(o.upcharge)}`}`}
              onClick={() => setBrand(itemId, o.id)}
              className={cn(
                "relative flex flex-col items-center rounded-xl border p-1.5 text-center transition-[border-color,background-color,box-shadow]",
                on
                  ? "border-primary bg-primary-soft ring-1 ring-primary/40"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              {on && (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <img
                src={brandPhoto(itemId, o.id)}
                alt=""
                loading="lazy"
                width={96}
                height={96}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <span className="mt-1 line-clamp-1 text-[11px] font-bold leading-tight">
                {o.name}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  i === 0 ? "text-success-ink" : "text-muted-foreground",
                )}
              >
                {i === 0 ? baseLabel : `+${formatINR(o.upcharge)}`}
              </span>
            </button>
          );
        })}
      </div>
      {picked && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{picked.name}</span> · {picked.note}
        </p>
      )}
    </div>
  );
}
