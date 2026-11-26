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
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${o.name}, ${formatINR(brandMarketPrice(itemId, o))}${i === 0 ? `, ${baseLabel}` : ""}`}
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
                  "text-foreground",
                )}
              >
                {formatINR(brandMarketPrice(itemId, o))}
                {i === 0 && <span className="block text-[9px] text-success-ink">{baseLabel}</span>}
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
      <details className="group mt-2 rounded-xl border border-dashed border-border px-2.5 py-1.5">
        <summary className="cursor-pointer list-none text-xs font-semibold text-primary">
          <span className="inline-flex items-center gap-1">
            <Plus className="size-3.5" /> Also add another brand
          </span>
        </summary>
        <ul className="mt-2 space-y-1.5">
          {options
            .filter((o) => o.id !== picked?.id)
            .map((o) => {
              const n = moreBrandQty(cart, itemId, o.id);
              const label = `${o.name} ${itemName}`;
              return (
                <li key={o.id} className="flex items-center gap-2 text-xs">
                  <img
                    src={brandPhoto(itemId, o.id)}
                    alt=""
                    loading="lazy"
                    width={32}
                    height={32}
                    className="size-8 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{o.name}</span>
                    <span className="text-muted-foreground">
                      {formatINR(brandMarketPrice(itemId, o))} each
                    </span>
                  </span>
                  {n === 0 ? (
                    <button
                      type="button"
                      onClick={() => setMoreBrand(itemId, o.id, 1, kitId)}
                      aria-label={`Add ${label}`}
                      className="rounded-lg border border-primary/40 px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary-soft"
                    >
                      Add
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        aria-label={`Remove one ${label}`}
                        onClick={() => setMoreBrand(itemId, o.id, n - 1, kitId)}
                        className="grid size-7 place-items-center"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-5 text-center font-bold" aria-live="polite">
                        {n}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add one more ${label}`}
                        onClick={() => setMoreBrand(itemId, o.id, n + 1, kitId)}
                        className="grid size-7 place-items-center"
                      >
                        <Plus className="size-3" />
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
        </ul>
      </details>
    </div>
  );
}
