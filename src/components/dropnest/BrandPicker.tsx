import { Check, Minus, Plus } from "lucide-react";

import { brandPhoto } from "@/components/dropnest/itemPhotos";
import { useDropnest } from "@/components/dropnest/store";
import { cn } from "@/lib/utils";
import {
  brandMarketPrice,
  formatINR,
  itemBrandOptions,
  moreBrandQty,
  selectedBrand,
  type KitId,
} from "@/lib/dropnest";

/**
 * Brand choices for one item, each with its own photo and price. The first
 * brand comes with the kit; others show what they add per unit.
 */
export function BrandPicker({
  itemId,
  itemName,
  baseLabel = "Included",
  kitId,
}: {
  /** Kit to add to the cart if the customer adds an extra brand while the cart is empty. */
  kitId?: KitId;
  itemId: string;
  itemName: string;
  /** Label for the first (₹0 extra) brand, e.g. "Included" in a kit or "Base" for add-ons. */
  baseLabel?: string;
}) {
  const { cart, setBrand, setMoreBrand } = useDropnest();
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
        className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-4"
      >
        {options.map((o, i) => {
          const on = picked?.id === o.id;
          const n = on ? 0 : moreBrandQty(cart, itemId, o.id);
          const label = `${o.name} ${itemName}`;
          return (
            <div key={o.id} className="relative">
              <button
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${o.name}, ${formatINR(brandMarketPrice(itemId, o))}${i === 0 ? `, ${baseLabel}` : ""}`}
                onClick={() => setBrand(itemId, o.id)}
                className={cn(
                  "flex w-full flex-col items-center rounded-xl border p-1.5 text-center transition-[border-color,background-color,box-shadow]",
                  on
                    ? "border-primary bg-primary-soft ring-1 ring-primary/40"
                    : n > 0
                      ? "border-primary/60 bg-card"
                      : "border-border bg-card hover:border-primary/40",
                )}
              >
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
                <span className="text-[10px] font-semibold text-foreground">
                  {formatINR(brandMarketPrice(itemId, o))}
                  {i === 0 && <span className="block text-[9px] text-success-ink">{baseLabel}</span>}
                </span>
              </button>
              {on ? (
                <span className="pointer-events-none absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              ) : n === 0 ? (
                <button
                  type="button"
                  onClick={() => setMoreBrand(itemId, o.id, 1, kitId)}
                  aria-label={`Also add ${label}`}
                  title="Also add this brand"
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full border border-primary/40 bg-card text-primary shadow-sm transition-transform hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="size-3.5" />
                </button>
              ) : (
                <span className="absolute inset-x-1 top-1 flex items-center justify-between rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
                  <button
                    type="button"
                    aria-label={`Remove one ${label}`}
                    onClick={() => setMoreBrand(itemId, o.id, n - 1, kitId)}
                    className="grid size-6 place-items-center"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span aria-live="polite">+{n}</span>
                  <button
                    type="button"
                    aria-label={`Add one more ${label}`}
                    onClick={() => setMoreBrand(itemId, o.id, n + 1, kitId)}
                    className="grid size-6 place-items-center"
                  >
                    <Plus className="size-3" />
                  </button>
                </span>
              )}
            </div>
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
