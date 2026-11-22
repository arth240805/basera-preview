import { describe, expect, it } from "vitest";
import {
  ADDONS,
  KITS,
  cartTotals,
  checklistProgress,
  formatDeliveryAddress,
  validateDeliveryDetails,
  deliveryBadge,
  earliestMoveInDate,
  isValidIndianPhone,
  itemLineQty,
  planDelivery,
  recommendKit,
  setItemQty,
  setItemAddonQty,
  suggestedItemAddons,
} from "@/lib/dropnest";

describe("Dropnest catalogue", () => {
  it("Basic kit has 10 items at ₹2,799 (was ₹4,499)", () => {
    expect(KITS.basic.items).toHaveLength(10);
    expect(KITS.basic.price).toBe(2799);
    expect(KITS.basic.originalPrice).toBe(4499);
  });
  it("Standard kit has 19 items at ₹5,499 (was ₹8,999) and is most popular", () => {
    expect(KITS.standard.items).toHaveLength(19);
    expect(KITS.standard.price).toBe(5499);
    expect(KITS.standard.originalPrice).toBe(8999);
    expect(KITS.standard.popular).toBe(true);
  });
  it("Premium kit has 25 items at ₹8,499 (was ₹13,499)", () => {
    expect(KITS.premium.items).toHaveLength(25);
    expect(KITS.premium.price).toBe(8499);
    expect(KITS.premium.originalPrice).toBe(13499);
  });
  it("add-ons cost ₹499, ₹349 and ₹299", () => {
    expect(ADDONS["extra-bedsheet"].price).toBe(499);
    expect(ADDONS["mosquito-net"].price).toBe(349);
    expect(ADDONS["cutlery-set"].price).toBe(299);
  });
});

describe("Cart totals", () => {
  it("shipping and COD fee are free", () => {
    const t = cartTotals({ kits: { standard: 1 }, addons: ["mosquito-net"] });
    expect(t.shipping).toBe(0);
    expect(t.codFee).toBe(0);
    expect(t.total).toBe(5499 + 349);
    expect(t.savings).toBe(8999 - 5499);
  });
});

describe("Delivery", () => {
  const today = new Date(2026, 10, 11);
  it("Kota gets next-day delivery", () => {
    expect(deliveryBadge("Kota").label).toBe("⚡ Next-Day Delivery Available in Kota");
  });
  it("kit arrives 24 hours before move-in", () => {
    const plan = planDelivery("Bengaluru", new Date(2026, 10, 20), today);
    expect(plan.arrivalDate).toEqual(new Date(2026, 10, 19));
    expect(plan.dispatchDate).toEqual(new Date(2026, 10, 17));
    expect(plan.feasible).toBe(true);
  });
  it("earliest Kota move-in is 2 days out (1 day transit + 1 day buffer)", () => {
    expect(earliestMoveInDate("Kota", today)).toEqual(new Date(2026, 10, 13));
  });
});

describe("Room quiz", () => {
  it("budget → Basic, productivity → Standard, luxury → Premium", () => {
    expect(recommendKit({ persona: "hostel", room: "single", priority: "budget" }).kitId).toBe(
      "basic",
    );
    expect(
      recommendKit({ persona: "hostel", room: "single", priority: "productivity" }).kitId,
    ).toBe("standard");
    expect(recommendKit({ persona: "hostel", room: "single", priority: "luxury" }).kitId).toBe(
      "premium",
    );
  });
  it("a 1BHK flat never gets less than Standard", () => {
    expect(recommendKit({ persona: "professional", room: "flat", priority: "budget" }).kitId).toBe(
      "standard",
    );
  });
});

describe("Checklist & validation", () => {
  it("4 of 12 packed is 33%", () => {
    expect(checklistProgress(4)).toBe(33);
  });
  it("accepts Indian mobiles only", () => {
    expect(isValidIndianPhone("+91 98765 43210")).toBe(true);
    expect(isValidIndianPhone("5876543210")).toBe(false);
  });
});

describe("Extra units of a single item", () => {
  const empty = { kits: {}, addons: [], extras: {} };
  it("every item starts at 1 and can never go below 1", () => {
    expect(itemLineQty(empty, "basic", "pillow")).toBe(1);
    const down = setItemQty({ kits: { basic: 1 }, addons: [] }, "basic", "pillow", 0);
    expect(itemLineQty(down, "basic", "pillow")).toBe(1);
    expect(cartTotals(down).total).toBe(2799);
  });
  it("going from 1 to 2 pillows adds one extra pillow's price", () => {
    const c = setItemQty({ kits: { basic: 1 }, addons: [] }, "basic", "pillow", 2);
    expect(itemLineQty(c, "basic", "pillow")).toBe(2);
    expect(cartTotals(c).total).toBe(2799 + 299);
  });
  it("adding an extra item to a kit not yet in the cart adds the kit", () => {
    const c = setItemQty(empty, "standard", "kettle", 3);
    expect(c.kits.standard).toBe(1);
    expect(cartTotals(c).total).toBe(5499 + 2 * 799);
  });
});

describe("Guest checkout delivery details", () => {
  const ok = {
    name: "Aarav Sharma",
    phone: "98765 43210",
    hostel: "Allen Boys Hostel",
    block: "B",
    room: "204",
    landmark: "City Mall",
    pincode: "324005",
    contactName: "Mr. Verma (Warden)",
    altPhone: "91234 56789",
  };
  it("block and landmark are optional", () => {
    expect(validateDeliveryDetails({ ...ok, block: "", landmark: "" })).toEqual({});
  });
  it("hostel/PG name, room number, contact person and alternate phone are required", () => {
    const err = validateDeliveryDetails({
      ...ok,
      hostel: "",
      room: "",
      contactName: "",
      altPhone: "",
    });
    expect(Object.keys(err).sort()).toEqual(["altPhone", "contactName", "hostel", "room"]);
  });
  it("alternate phone must differ from the receiver's mobile", () => {
    expect(
      validateDeliveryDetails({ ...ok, altPhone: "+91 9876543210" })["altPhone"],
    ).toBeDefined();
  });
  it("formats the full address on one line", () => {
    expect(formatDeliveryAddress(ok, "Kota")).toBe(
      "Room 204, Block B, Allen Boys Hostel, Near City Mall, Kota 324005",
    );
  });
});

describe("Items from other kits as add-ons", () => {
  it("Basic suggests all 15 Standard + Premium items", () => {
    const s = suggestedItemAddons({ kits: { basic: 1 }, addons: [] });
    expect(s).toHaveLength(15);
    expect(s.map((i) => i.id)).toContain("kettle");
    expect(s.map((i) => i.id)).toContain("iron");
  });
  it("Standard suggests the 6 Premium-only items", () => {
    expect(suggestedItemAddons({ kits: { standard: 1 }, addons: [] })).toHaveLength(6);
  });
  it("Premium already has everything, so nothing is suggested", () => {
    expect(suggestedItemAddons({ kits: { premium: 1 }, addons: [] })).toHaveLength(0);
  });
  it("adding a kettle to Basic charges the kettle's ₹799", () => {
    const c = setItemAddonQty({ kits: { basic: 1 }, addons: [] }, "kettle", 1);
    expect(cartTotals(c).total).toBe(2799 + 799);
  });
  it("an item add-on stops being charged once a kit that includes it is in the cart", () => {
    const c = setItemAddonQty({ kits: { basic: 1 }, addons: [] }, "kettle", 1);
    expect(cartTotals({ ...c, kits: { basic: 1, standard: 1 } }).total).toBe(2799 + 5499);
  });
  it("an item add-on can go back to 0", () => {
    const c = setItemAddonQty(
      { kits: { basic: 1 }, addons: [], items: { kettle: 1 } },
      "kettle",
      0,
    );
    expect(cartTotals(c).total).toBe(2799);
  });
});
