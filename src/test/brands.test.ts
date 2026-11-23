import { describe, expect, it } from "vitest";

import { BRAND_PHOTOS } from "@/components/dropnest/itemPhotos";
import {
  ITEM_BRANDS,
  KITS,
  cartTotals,
  itemUnitPrice,
  kitPriceWithBrands,
  setItemBrand,
  setItemQty,
  type CartState,
} from "@/lib/dropnest";

const empty: CartState = { kits: {}, addons: [], extras: {}, items: {} };

describe("Brand choices per item", () => {
  it("every item in every kit offers at least 3 brands, the first included at ₹0", () => {
    for (const item of KITS.premium.items) {
      const brands = ITEM_BRANDS[item.id] ?? [];
      expect(brands.length, item.id).toBeGreaterThanOrEqual(3);
      expect(brands[0]?.upcharge, item.id).toBe(0);
      expect(brands.slice(1).every((b) => b.upcharge > 0), item.id).toBe(true);
    }
  });

  it("brand ids are unique within each item", () => {
    for (const item of KITS.premium.items) {
      const ids = (ITEM_BRANDS[item.id] ?? []).map((b) => b.id);
      expect(new Set(ids).size, item.id).toBe(ids.length);
    }
  });

  it("every brand, including the included one, has its own photo", () => {
    for (const item of KITS.premium.items) {
      for (const brand of ITEM_BRANDS[item.id] ?? []) {
        expect(BRAND_PHOTOS[`${item.id}--${brand.id}`], `${item.id}/${brand.id}`).toBeTruthy();
      }
    }
  });

  it("picking Philips for the kettle adds ₹449 to the Standard kit price", () => {
    const cart = setItemBrand(empty, "kettle", "philips");
    expect(kitPriceWithBrands(cart, "standard")).toBe(5499 + 449);
  });

  it("brand upgrade is charged once per kit in the cart", () => {
    const cart = setItemBrand({ ...empty, kits: { basic: 2 } }, "pillow", "sleepwell");
    expect(cartTotals(cart).total).toBe(2799 * 2 + 199 * 2);
  });

  it("extra units are priced in the picked brand", () => {
    let cart = setItemBrand({ ...empty, kits: { basic: 1 } }, "bedsheet", "spaces");
    expect(itemUnitPrice(cart, "bedsheet")).toBe(499 + 399);
    cart = setItemQty(cart, "basic", "bedsheet", 2);
    expect(cartTotals(cart).total).toBe(2799 + 399 + (499 + 399));
  });

  it("switching back to the included brand removes the upgrade", () => {
    let cart = setItemBrand({ ...empty, kits: { basic: 1 } }, "pillow", "sleepwell");
    cart = setItemBrand(cart, "pillow", "recron");
    expect(cartTotals(cart).total).toBe(2799);
  });
});
