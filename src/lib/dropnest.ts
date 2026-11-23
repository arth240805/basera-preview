import { addDays, differenceInCalendarDays, startOfDay, subDays } from "date-fns";

export type KitId = "basic" | "standard" | "premium";
export type AddonId = "extra-bedsheet" | "mosquito-net" | "cutlery-set";
export type City = "Kota" | "Pune" | "Delhi NCR" | "Bengaluru" | "Hyderabad" | "Mumbai" | "Other";

export interface KitItem {
  id: string;
  name: string;
  /** What one unit of this line contains, e.g. "6 pcs" for a pack of hangers. */
  qty: string;
  /** Price of each extra unit added on top of the one included in the kit. */
  extraPrice: number;
}

export interface Kit {
  id: KitId;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  popular?: boolean;
  items: KitItem[];
}

const BASIC_ITEMS: KitItem[] = [
  {
    id: "bedsheet",
    name: "Breathable Cotton Single Bedsheet (72x36 PG Size)",
    qty: "1 pc",
    extraPrice: 499,
  },
  { id: "pillow", name: "Ergonomic Fiber Pillow", qty: "1 pc", extraPrice: 299 },
  {
    id: "lap-table",
    name: "Heavy-Duty Foldable Bed/Lap Study Table",
    qty: "1 pc",
    extraPrice: 699,
  },
  { id: "hangers", name: "Pack of 6 Tough Clothes Hangers", qty: "6 pcs", extraPrice: 149 },
  {
    id: "bucket-mug",
    name: "Virgin Plastic Bucket & Mug Set (20L + 1L)",
    qty: "1 set",
    extraPrice: 299,
  },
  {
    id: "detergent-scrub",
    name: "Compact Detergent Powder & Scrub Pack",
    qty: "1 pack",
    extraPrice: 129,
  },
  {
    id: "hygiene-kit",
    name: "4-in-1 Hygiene Kit (Soap, Shampoo, Toothpaste, Toothbrush)",
    qty: "1 kit",
    extraPrice: 199,
  },
  {
    id: "handwash",
    name: "Liquid Anti-Bacterial Handwash (250ml)",
    qty: "1 bottle",
    extraPrice: 99,
  },
  {
    id: "mirror-comb",
    name: "Grooming Kit (Unbreakable Mirror & Comb)",
    qty: "1 set",
    extraPrice: 99,
  },
  { id: "study-chair", name: "Foldable Compact Study Chair", qty: "1 pc", extraPrice: 899 },
];

const STANDARD_EXTRA: KitItem[] = [
  { id: "led-lamp", name: "Flexible Eye-Care LED Table Lamp", qty: "1 pc", extraPrice: 549 },
  { id: "dustbin", name: "Compact Under-Desk Dustbin", qty: "1 pc", extraPrice: 149 },
  {
    id: "extension-board",
    name: "4-Socket Heavy-Duty Extension Board with Surge Protection (2m cord)",
    qty: "1 pc",
    extraPrice: 449,
  },
  { id: "door-mat", name: "High-Absorbency Anti-Skid Door-Mat", qty: "1 pc", extraPrice: 199 },
  {
    id: "kettle",
    name: "Stainless Steel Automatic Electric Kettle (1.5L)",
    qty: "1 pc",
    extraPrice: 799,
  },
  {
    id: "stationery",
    name: "Student Stationery Set (Notebook, pens, highlighters, sticky notes)",
    qty: "1 set",
    extraPrice: 249,
  },
  {
    id: "clothes-clips",
    name: "Pack of 12 Windproof Clothes Clips",
    qty: "12 pcs",
    extraPrice: 99,
  },
  {
    id: "adhesive-hooks",
    name: "Pack of 6 Heavy-Duty Damage-Free Adhesive Hooks (No-drill)",
    qty: "6 pcs",
    extraPrice: 129,
  },
  { id: "wall-clock", name: "Minimalist Wall/Desk Clock", qty: "1 pc", extraPrice: 349 },
];

const PREMIUM_EXTRA: KitItem[] = [
  { id: "room-freshener", name: "Automatic Room Freshener Spray", qty: "1 unit", extraPrice: 399 },
  { id: "slippers", name: "Anti-Slip Washable Indoor Slippers", qty: "1 pair", extraPrice: 249 },
  {
    id: "first-aid",
    name: "Travel First-Aid Emergency Kit (Bandages, antiseptic, pain relief)",
    qty: "1 kit",
    extraPrice: 299,
  },
  { id: "iron", name: "Dry/Steam Non-Stick Clothes Iron", qty: "1 pc", extraPrice: 699 },
  {
    id: "lock-box",
    name: "Heavy-Duty Steel Lockable Security Box (With keys for documents & cash)",
    qty: "1 pc",
    extraPrice: 999,
  },
  {
    id: "quilt",
    name: "Microfiber All-Weather Quilt / Mattress Protector",
    qty: "1 pc",
    extraPrice: 899,
  },
];

/** One brand choice for a kit item. The first option of each item comes with the kit (₹0). */
export interface ItemBrand {
  id: string;
  name: string;
  /** Who this brand suits, e.g. "Budget pick" or "Best for long study hours". */
  note: string;
  /** Extra charged per unit over the included brand. */
  upcharge: number;
}

const b = (name: string, note: string, upcharge = 0): ItemBrand => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  note,
  upcharge,
});

/** Brand options per item id. Index 0 is the brand included in the kit price. */
export const ITEM_BRANDS: Record<string, ItemBrand[]> = {
  bedsheet: [
    b("Story@Home", "Soft everyday cotton"),
    b("Trident", "Soft, colour-fast cotton", 149),
    b("Bombay Dyeing", "Thicker weave, lasts longer", 199),
    b("Raymond Home", "Premium cotton sateen", 349),
    b("Spaces", "Hotel-feel 200 TC cotton", 399),
    b("Portico New York", "Luxe hotel-style finish", 449),
  ],
  pillow: [
    b("Recron", "Medium-soft fibre"),
    b("Sleepyhead", "Plump and soft", 149),
    b("Sleepwell", "Firmer neck support", 199),
    b("Wakefit", "Hollow fibre, keeps shape", 249),
    b("Duroflex", "Orthopaedic neck support", 299),
    b("The Sleep Company", "Stays cool in hot cities", 499),
  ],
  "lap-table": [
    b("Callas", "Light and easy to fold"),
    b("Flipkart Perfect Homes", "Wooden top, folds flat", 99),
    b("Gizga Essentials", "Tilting top, cup holder", 149),
    b("Nilkamal", "Sturdier top for laptops", 199),
  ],
  hangers: [
    b("Kuber Industries", "Everyday plastic"),
    b("Jyoti", "Swivel chrome hook", 49),
    b("LivingBasics", "Space-saving magic hanger", 79),
    b("Homestic", "Non-slip velvet for shirts", 129),
  ],
  "bucket-mug": [
    b("Princeware", "Standard virgin plastic"),
    b("Joyo", "Light, budget bucket", 39),
    b("Nayasa", "Bright colours, sturdy handle", 69),
    b("Cello", "Thicker, crack-resistant", 99),
    b("Milton", "Heavy-duty, longest life", 179),
  ],
  "detergent-scrub": [
    b("Ghadi", "Budget pick"),
    b("Wheel", "Gentle on hands", 19),
    b("Rin", "Brighter whites", 29),
    b("Tide", "Better on everyday stains", 49),
    b("Surf Excel", "Best for tough stains", 89),
    b("Ariel", "Deep clean, fewer washes", 99),
  ],
  "hygiene-kit": [
    b("Lifebuoy & Colgate", "Everyday essentials"),
    b("Patanjali", "Ayurvedic basics", 29),
    b("Dettol & Pepsodent", "Germ protection for skin & teeth", 49),
    b("Pears & Closeup", "Gentle glycerin, fresh breath", 59),
    b("Himalaya Herbals", "Herbal, gentle on skin", 79),
    b("Dove & Sensodyne", "For sensitive skin & teeth", 149),
  ],
  handwash: [
    b("Lifebuoy", "Everyday germ protection"),
    b("Godrej Protekt", "Mild, kids-safe", 10),
    b("Savlon", "Antiseptic, budget pick", 15),
    b("Dettol", "Trusted antiseptic", 20),
    b("Himalaya", "Neem, soft on hands", 30),
    b("Palmolive", "Moisturising, fresh scents", 40),
  ],
  "mirror-comb": [
    b("Gubb", "Compact everyday set"),
    b("Majestique", "Detangling, budget pick", 39),
    b("Roots", "Wide-tooth, less hair fall", 49),
    b("Vega", "Bigger mirror, salon comb", 99),
  ],
  "study-chair": [
    b("Nilkamal", "Light and foldable"),
    b("Cello", "Sturdy plastic, easy to clean", 199),
    b("Supreme", "Thicker seat, more stable", 249),
    b("Savya Home", "Mesh back, stays cool", 699),
    b("Green Soul", "Cushioned, for long hours", 899),
  ],
  "led-lamp": [
    b("Syska", "Bright, budget pick"),
    b("Halonix", "Rechargeable, flexible neck", 49),
    b("Crompton", "Touch dimmer", 99),
    b("Wipro", "3 light modes", 149),
    b("Havells", "Warm-to-cool light", 199),
    b("Philips", "Flicker-free for late-night study", 299),
  ],
  dustbin: [
    b("Cello", "Open-top, compact"),
    b("Kuber Industries", "Swing lid, budget", 19),
    b("Solimo", "Pedal bin, slim", 39),
    b("Nilkamal", "Swing lid, hides mess", 49),
    b("Milton", "Pedal bin, hands-free", 99),
  ],
  "extension-board": [
    b("Anchor", "4 sockets with surge guard"),
    b("Goldmedal", "Compact, switch per socket", 49),
    b("Syska", "Spike guard, long cord", 79),
    b("GM", "Child shutters, sturdy body", 99),
    b("Havells", "Thicker cord, child shutters", 149),
    b("Portronics", "Adds USB ports for phones", 249),
    b("Belkin", "Adds 2 USB ports for phones", 449),
  ],
  "door-mat": [
    b("Status", "Everyday anti-skid"),
    b("Kuber Industries", "Soft microfibre", 29),
    b("Solimo", "Coir-look, tough", 59),
    b("Saral Home", "Thicker, quick-dry", 79),
    b("Story@Home", "Washable, bright prints", 99),
  ],
  kettle: [
    b("Pigeon", "1.5L, auto cut-off"),
    b("Butterfly", "Steel body, quick boil", 99),
    b("Bajaj", "Sturdy, 2-year warranty", 149),
    b("Prestige", "Faster boil, cool handle", 200),
    b("Kent", "Double wall, safe to touch", 299),
    b("Havells", "Wide mouth, easy clean", 349),
    b("Morphy Richards", "Fast 1500W boil", 399),
    b("Philips", "Concealed coil, easy clean", 449),
  ],
  stationery: [
    b("Classmate", "Everyday student set"),
    b("Doms", "Bright, smooth pencils", 39),
    b("Navneet", "Ruled notebooks, budget", 49),
    b("Camlin", "Smoother pens & markers", 79),
    b("Luxor", "Bold highlighters", 99),
    b("Faber-Castell", "Premium pens & highlighters", 199),
  ],
  "clothes-clips": [
    b("Glanz", "Everyday plastic clips"),
    b("Home's Need", "Stronger spring grip", 19),
    b("SM Homes", "Heavy-duty, holds towels", 29),
    b("Cosmolin", "Non-slip, comes with a basket", 49),
  ],
  "adhesive-hooks": [
    b("Rianz", "Holds up to 3 kg each"),
    b("Flipkart SmartBuy", "Strong sticker, no nails", 29),
    b("Homeaker", "Transparent, waterproof", 49),
    b("3M Command", "Zero wall damage on removal", 249),
  ],
  "wall-clock": [
    b("Ajanta", "Simple and reliable"),
    b("Orpat", "Bold numbers, easy to read", 49),
    b("Oreva", "Silent sweep, no ticking", 99),
    b("Titan", "Minimal design, lasts years", 599),
  ],
  "room-freshener": [
    b("Odonil", "Fresh, budget pick"),
    b("Godrej aer", "Longer-lasting scents", 99),
    b("Ambi Pur", "Neutralises odours", 149),
    b("Air Wick", "Automatic timed spray", 249),
  ],
  slippers: [
    b("Paragon", "Washable, everyday"),
    b("Relaxo", "Light, budget pick", 49),
    b("Bata", "Softer sole, better grip", 99),
    b("Campus", "Cushioned slides", 149),
    b("Sparx", "Cushioned, for long days", 199),
    b("Adidas", "Branded comfort slides", 599),
  ],
  "first-aid": [
    b("St Johns", "Compact travel box"),
    b("Hansaplast", "More bandage sizes", 99),
    b("Johnson & Johnson", "Fullest kit with ointments", 199),
  ],
  iron: [
    b("Bajaj", "Light dry iron"),
    b("Orient", "Non-stick, quick heat", 99),
    b("Usha", "Steam for crisp shirts", 149),
    b("Morphy Richards", "Glides smoothly, auto cut-off", 199),
    b("Havells", "Heavy plate, fewer passes", 249),
    b("Philips", "Faster heat, non-stick glide", 349),
  ],
  "lock-box": [
    b("Ozone", "Steel box with 2 keys"),
    b("Yale", "Thicker steel, sturdier lock", 499),
    b("Godrej", "Bolt-down, highest security", 899),
  ],
  quilt: [
    b("Story@Home", "Light all-weather"),
    b("Solimo", "Microfibre, budget warm", 99),
    b("Divine Casa", "Soft, reversible", 199),
    b("Bombay Dyeing", "Warmer for cold cities", 299),
    b("Spaces", "Plush, hotel quality", 499),
    b("Raymond Home", "Plush, premium feel", 599),
  ],
};

export const KITS: Record<KitId, Kit> = {
  basic: {
    id: "basic",
    name: "Basic Kit",
    tagline: "The essentials to sleep, bathe & study from night one.",
    price: 2799,
    originalPrice: 4499,
    items: BASIC_ITEMS,
  },
  standard: {
    id: "standard",
    name: "Standard Kit",
    tagline: "Everything in Basic, plus the gear that makes a room productive.",
    price: 5499,
    originalPrice: 8999,
    popular: true,
    items: [...BASIC_ITEMS, ...STANDARD_EXTRA],
  },
  premium: {
    id: "premium",
    name: "Premium Kit",
    tagline: "The full move-in. Comfort, safety and zero last-minute runs.",
    price: 8499,
    originalPrice: 13499,
    items: [...BASIC_ITEMS, ...STANDARD_EXTRA, ...PREMIUM_EXTRA],
  },
};

export const KIT_ORDER: KitId[] = ["basic", "standard", "premium"];

export function isKitId(v: string): v is KitId {
  return (KIT_ORDER as string[]).includes(v);
}

export interface KitItemGroup {
  title: string;
  text: string;
  items: KitItem[];
}

/** A kit's items split into the tiers they come from, for the kit detail page. */
export function kitItemGroups(id: KitId): KitItemGroup[] {
  const groups: KitItemGroup[] = [
    {
      title: "Room Essentials",
      text: "Sleep, bath, laundry and study from night one.",
      items: BASIC_ITEMS,
    },
  ];
  if (id !== "basic")
    groups.push({
      title: "Study & Productivity Upgrade",
      text: "Light, power and stationery that turn a room into a study zone.",
      items: STANDARD_EXTRA,
    });
  if (id === "premium")
    groups.push({
      title: "Comfort & Safety Upgrade",
      text: "Quilt, iron, first-aid and a lockable box for zero last-minute runs.",
      items: PREMIUM_EXTRA,
    });
  return groups;
}

export interface Addon {
  id: AddonId;
  name: string;
  price: number;
  note: string;
}

export const ADDONS: Record<AddonId, Addon> = {
  "extra-bedsheet": {
    id: "extra-bedsheet",
    name: "Extra Bedsheet",
    price: 499,
    note: "Swap while one dries",
  },
  "mosquito-net": {
    id: "mosquito-net",
    name: "Mosquito Net",
    price: 349,
    note: "Foldable, single bed",
  },
  "cutlery-set": {
    id: "cutlery-set",
    name: "Cutlery & Plate Set",
    price: 299,
    note: "Steel, 6-piece",
  },
};

export const ADDON_ORDER: AddonId[] = ["extra-bedsheet", "mosquito-net", "cutlery-set"];

export const CITIES: City[] = [
  "Kota",
  "Pune",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Other",
];

/** Days in transit from dispatch to doorstep, per city. */
export const CITY_TRANSIT_DAYS: Record<City, number> = {
  Kota: 1,
  Pune: 1,
  "Delhi NCR": 1,
  Bengaluru: 2,
  Hyderabad: 2,
  Mumbai: 3,
  Other: 5,
};

export function deliveryBadge(city: City): { label: string; fast: boolean } {
  const days = CITY_TRANSIT_DAYS[city];
  if (city === "Other") return { label: "📦 4–6 day delivery across India", fast: false };
  if (days === 1) return { label: `⚡ Next-Day Delivery Available in ${city}`, fast: true };
  return { label: `🚚 ${days}-Day Delivery to ${city}`, fast: false };
}

/** Kit lands 24 hours (1 day) before move-in. */
export const ARRIVE_BEFORE_DAYS = 1;

export function earliestMoveInDate(city: City, today: Date): Date {
  return addDays(startOfDay(today), CITY_TRANSIT_DAYS[city] + ARRIVE_BEFORE_DAYS);
}

export interface DeliveryPlan {
  dispatchDate: Date;
  arrivalDate: Date;
  feasible: boolean;
}

export function planDelivery(city: City, moveIn: Date, today: Date): DeliveryPlan {
  const move = startOfDay(moveIn);
  const arrivalDate = subDays(move, ARRIVE_BEFORE_DAYS);
  const dispatchDate = subDays(arrivalDate, CITY_TRANSIT_DAYS[city]);
  const feasible = differenceInCalendarDays(dispatchDate, startOfDay(today)) >= 0;
  return { dispatchDate, arrivalDate, feasible };
}

export interface CartState {
  kits: Partial<Record<KitId, number>>;
  addons: AddonId[];
  /** Extra units of individual kit items, per kit, beyond the 1 included. */
  extras?: Partial<Record<KitId, Record<string, number>>>;
  /** Single items from a bigger kit, bought as add-ons on top of a smaller kit. */
  items?: Record<string, number>;
  /** Brand picked per item id; missing means the included (first) brand. */
  brands?: Record<string, string>;
}

export const ITEMS_BY_ID: Record<string, KitItem> = Object.fromEntries(
  KITS.premium.items.map((it) => [it.id, it]),
);

export function itemBrandOptions(itemId: string): ItemBrand[] {
  return ITEM_BRANDS[itemId] ?? [];
}

/** The brand the customer picked for an item, falling back to the included one. */
export function selectedBrand(cart: CartState, itemId: string): ItemBrand | null {
  const options = itemBrandOptions(itemId);
  const picked = cart.brands?.[itemId];
  return options.find((o) => o.id === picked) ?? options[0] ?? null;
}

/** Extra per unit for the picked brand (₹0 for the included brand). */
export function brandUpcharge(cart: CartState, itemId: string): number {
  return selectedBrand(cart, itemId)?.upcharge ?? 0;
}

/** Pick a brand for an item. Unknown brands are ignored; the included brand clears the choice. */
export function setItemBrand(cart: CartState, itemId: string, brandId: string): CartState {
  const options = itemBrandOptions(itemId);
  const idx = options.findIndex((o) => o.id === brandId);
  if (idx < 0) return cart;
  const brands = { ...(cart.brands ?? {}) };
  if (idx === 0) delete brands[itemId];
  else brands[itemId] = brandId;
  return { ...cart, brands };
}

/** Price of one more unit of an item, in the picked brand. */
export function itemUnitPrice(cart: CartState, itemId: string): number {
  const item = ITEMS_BY_ID[itemId];
  return item ? item.extraPrice + brandUpcharge(cart, itemId) : 0;
}

/** Brand upgrades on the units included in a kit that's in the cart (charged per kit). */
export function kitBrandLines(
  cart: CartState,
  kitId: KitId,
): { item: KitItem; brand: ItemBrand; amount: number }[] {
  const kitQty = cart.kits[kitId] ?? 0;
  if (!kitQty) return [];
  return KITS[kitId].items.flatMap((item) => {
    const brand = selectedBrand(cart, item.id);
    return brand && brand.upcharge > 0 ? [{ item, brand, amount: brand.upcharge * kitQty }] : [];
  });
}

/** Brand upgrades picked for a kit's items, per one kit, whether or not the kit is in the cart yet. */
export function kitBrandPicks(cart: CartState, kitId: KitId): { item: KitItem; brand: ItemBrand }[] {
  return KITS[kitId].items.flatMap((item) => {
    const brand = selectedBrand(cart, item.id);
    return brand && brand.upcharge > 0 ? [{ item, brand }] : [];
  });
}

/** What one kit costs with the customer's brand picks. */
export function kitPriceWithBrands(cart: CartState, kitId: KitId): number {
  return KITS[kitId].price + kitBrandPicks(cart, kitId).reduce((s, p) => s + p.brand.upcharge, 0);
}

export function kitBrandTotal(cart: CartState, kitId: KitId): number {
  return kitBrandLines(cart, kitId).reduce((s, l) => s + l.amount, 0);
}

/** Everything a kit line costs: kit price × qty, brand upgrades and extra units. */
export function kitLineTotal(cart: CartState, kitId: KitId): number {
  const qty = cart.kits[kitId] ?? 0;
  if (!qty) return 0;
  return KITS[kitId].price * qty + kitBrandTotal(cart, kitId) + kitExtrasTotal(cart, kitId);
}

/** How many units of an item line the customer gets: always at least the 1 included. */
export function itemLineQty(cart: CartState, kitId: KitId, itemId: string): number {
  return 1 + (cart.extras?.[kitId]?.[itemId] ?? 0);
}

/**
 * Set how many units of one item a kit should contain. Never goes below 1 (the
 * included unit can't be removed). Raising an item in a kit that isn't in the
 * cart yet adds that kit.
 */
export function setItemQty(cart: CartState, kitId: KitId, itemId: string, qty: number): CartState {
  if (!KITS[kitId].items.some((it) => it.id === itemId)) return cart;
  const extra = Math.max(0, Math.floor(qty) - 1);
  const kitExtras = { ...(cart.extras?.[kitId] ?? {}) };
  if (extra === 0) delete kitExtras[itemId];
  else kitExtras[itemId] = extra;
  const kits = extra > 0 && !(cart.kits[kitId] ?? 0) ? { ...cart.kits, [kitId]: 1 } : cart.kits;
  return { ...cart, kits, extras: { ...cart.extras, [kitId]: kitExtras } };
}

/** Extra item lines of a kit currently in the cart. */
export function kitExtraLines(
  cart: CartState,
  kitId: KitId,
): { item: KitItem; extra: number; amount: number }[] {
  if (!(cart.kits[kitId] ?? 0)) return [];
  return KITS[kitId].items
    .map((item) => {
      const extra = cart.extras?.[kitId]?.[item.id] ?? 0;
      return { item, extra, amount: extra * itemUnitPrice(cart, item.id) };
    })
    .filter((l) => l.extra > 0);
}

export function kitExtrasTotal(cart: CartState, kitId: KitId): number {
  return kitExtraLines(cart, kitId).reduce((s, l) => s + l.amount, 0);
}

/** The smallest kit an item first appears in (Basic, Standard or Premium). */
export function itemSourceKit(itemId: string): KitId {
  return KIT_ORDER.find((k) => KITS[k].items.some((it) => it.id === itemId)) ?? "premium";
}

/** Items from the other kits that this kit doesn't include, offered as single add-ons. */
export function kitUpgradeItems(kitId: KitId): KitItem[] {
  const own = new Set(KITS[kitId].items.map((it) => it.id));
  return KITS.premium.items.filter((it) => !own.has(it.id));
}

/** Biggest kit in the cart, which decides which items are already covered. */
export function topKitInCart(cart: CartState): KitId | null {
  return [...KIT_ORDER].reverse().find((k) => (cart.kits[k] ?? 0) > 0) ?? null;
}

/** Single-item add-ons to suggest for the cart: everything no kit in it already includes. */
export function suggestedItemAddons(cart: CartState): KitItem[] {
  const top = topKitInCart(cart);
  return top ? kitUpgradeItems(top) : [];
}

export function itemAddonQty(cart: CartState, itemId: string): number {
  return cart.items?.[itemId] ?? 0;
}

/**
 * Set how many of a single item add-on to buy (0 removes it). If no kit is in
 * the cart yet, `kitId` is added so the add-on has a kit to ride along with.
 */
export function setItemAddonQty(
  cart: CartState,
  itemId: string,
  qty: number,
  kitId?: KitId,
): CartState {
  if (!ITEMS_BY_ID[itemId]) return cart;
  const n = Math.max(0, Math.floor(qty));
  const items = { ...(cart.items ?? {}) };
  if (n === 0) delete items[itemId];
  else items[itemId] = n;
  const kits = n > 0 && kitId && !topKitInCart(cart) ? { ...cart.kits, [kitId]: 1 } : cart.kits;
  return { ...cart, kits, items };
}

/** Item add-ons that are charged: only ones not already included in a kit in the cart. */
export function itemAddonLines(cart: CartState): { item: KitItem; qty: number; amount: number }[] {
  return suggestedItemAddons(cart)
    .map((item) => {
      const qty = itemAddonQty(cart, item.id);
      return { item, qty, amount: qty * itemUnitPrice(cart, item.id) };
    })
    .filter((l) => l.qty > 0);
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  mrp: number;
  savings: number;
  shipping: number;
  codFee: number;
  total: number;
}

export function cartTotals(cart: CartState): CartTotals {
  let subtotal = 0;
  let mrp = 0;
  let itemCount = 0;
  for (const id of KIT_ORDER) {
    const qty = cart.kits[id] ?? 0;
    if (qty <= 0) continue;
    subtotal += KITS[id].price * qty;
    mrp += KITS[id].originalPrice * qty;
    itemCount += qty;
    for (const line of kitBrandLines(cart, id)) {
      subtotal += line.amount;
      mrp += line.amount;
    }
    for (const line of kitExtraLines(cart, id)) {
      subtotal += line.amount;
      mrp += line.amount;
      itemCount += line.extra;
    }
  }
  for (const line of itemAddonLines(cart)) {
    subtotal += line.amount;
    mrp += line.amount;
    itemCount += line.qty;
  }
  for (const id of cart.addons) {
    subtotal += ADDONS[id].price;
    mrp += ADDONS[id].price;
    itemCount += 1;
  }
  const shipping = 0;
  const codFee = 0;
  return {
    itemCount,
    subtotal,
    mrp,
    savings: mrp - subtotal,
    shipping,
    codFee,
    total: subtotal + shipping + codFee,
  };
}

export type Persona = "hostel" | "aspirant" | "professional";
export type RoomType = "single" | "shared" | "flat";
export type Priority = "budget" | "productivity" | "luxury";

export interface QuizAnswers {
  persona: Persona;
  room: RoomType;
  priority: Priority;
}

export interface Recommendation {
  kitId: KitId;
  addons: AddonId[];
  savings: number;
  total: number;
  reason: string;
}

export function recommendKit(a: QuizAnswers): Recommendation {
  let kitId: KitId =
    a.priority === "budget" ? "basic" : a.priority === "productivity" ? "standard" : "premium";
  let reason =
    a.priority === "budget"
      ? "You want the essentials without overspending — Basic covers sleep, bath and study from night one."
      : a.priority === "productivity"
        ? "A lamp, surge-protected extension board and stationery turn your room into a study zone."
        : "Quilt, iron, first-aid and a lockable box — the full move-in with zero last-minute runs.";

  // A whole flat needs more than a PG room, even on a budget.
  if (a.room === "flat" && kitId === "basic") {
    kitId = "standard";
    reason =
      "A full 1BHK needs a kettle, extension board and dustbin from day one — Standard is the smart floor.";
  }

  const addons = new Set<AddonId>();
  if (a.priority === "luxury") ADDON_ORDER.forEach((id) => addons.add(id));
  if (a.persona === "aspirant") addons.add("mosquito-net");
  if (a.room === "shared") addons.add("extra-bedsheet");
  if (a.room === "flat" || a.persona === "professional") addons.add("cutlery-set");
  if (addons.size === 0) addons.add("extra-bedsheet");

  const addonList = ADDON_ORDER.filter((id) => addons.has(id));
  const kit = KITS[kitId];
  const total = kit.price + addonList.reduce((s, id) => s + ADDONS[id].price, 0);
  return { kitId, addons: addonList, savings: kit.originalPrice - kit.price, total, reason };
}

export type ChecklistCategory = "Bedding" | "Study" | "Toiletries" | "Documents" | "Electronics";

export interface ChecklistItem {
  id: string;
  label: string;
  category: ChecklistCategory;
}

export const CHECKLIST: ChecklistItem[] = [
  { id: "bedsheet", label: "Bedsheet, pillow & pillow cover", category: "Bedding" },
  { id: "blanket", label: "Light blanket or quilt", category: "Bedding" },
  { id: "laptop", label: "Laptop & charger", category: "Study" },
  { id: "stationery", label: "Notebooks, pens & highlighters", category: "Study" },
  { id: "lamp", label: "Study lamp", category: "Study" },
  { id: "toothbrush", label: "Toothbrush, paste & soap", category: "Toiletries" },
  { id: "towel", label: "Two towels", category: "Toiletries" },
  { id: "medicines", label: "Personal medicines & prescriptions", category: "Toiletries" },
  { id: "id-docs", label: "Aadhaar + 4 passport photos", category: "Documents" },
  { id: "letters", label: "Admission letter / rent agreement copies", category: "Documents" },
  { id: "extension", label: "Extension board", category: "Electronics" },
  { id: "powerbank", label: "Phone charger & power bank", category: "Electronics" },
];

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  "Bedding",
  "Study",
  "Toiletries",
  "Documents",
  "Electronics",
];

export function checklistProgress(checkedCount: number): number {
  return Math.round((checkedCount / CHECKLIST.length) * 100);
}

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix and spaces. */
export function isValidIndianPhone(raw: string): boolean {
  const digits = raw.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits);
}

export function isValidPincode(raw: string): boolean {
  return /^[1-9]\d{5}$/.test(raw.trim());
}

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function discountPercent(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100);
}

/** Guest checkout delivery details: no account, just where and who to hand the box to. */
export interface DeliveryDetails {
  name: string;
  phone: string;
  hostel: string;
  block: string;
  room: string;
  landmark: string;
  pincode: string;
  contactName: string;
  altPhone: string;
}

export const EMPTY_DELIVERY: DeliveryDetails = {
  name: "",
  phone: "",
  hostel: "",
  block: "",
  room: "",
  landmark: "",
  pincode: "",
  contactName: "",
  altPhone: "",
};

function phoneDigits(raw: string): string {
  return raw.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
}

/**
 * Field errors for the delivery step. Block/wing and landmark are optional;
 * the destination contact and an alternate phone (different from the
 * receiver's mobile) are required.
 */
export function validateDeliveryDetails(d: DeliveryDetails): Record<string, string> {
  const err: Record<string, string> = {};
  if (d.name.trim().length < 2) err["name"] = "Enter the receiver's name.";
  if (!isValidIndianPhone(d.phone)) err["phone"] = "Enter a valid 10-digit mobile.";
  if (d.hostel.trim().length < 2) err["hostel"] = "Enter the hostel or PG name.";
  if (!d.room.trim()) err["room"] = "Enter the room number.";
  if (!isValidPincode(d.pincode)) err["pincode"] = "Enter a 6-digit pincode.";
  if (d.contactName.trim().length < 2)
    err["contactName"] = "Who can receive it? e.g. warden, reception or a parent.";
  if (!isValidIndianPhone(d.altPhone)) err["altPhone"] = "Enter a valid 10-digit mobile.";
  else if (isValidIndianPhone(d.phone) && phoneDigits(d.altPhone) === phoneDigits(d.phone))
    err["altPhone"] = "Use a different number from the receiver's mobile.";
  return err;
}

/** One-line address, e.g. "Room 204, Block B, Allen Boys Hostel, Near City Mall, Kota 324005". */
export function formatDeliveryAddress(d: DeliveryDetails, city: City): string {
  const room = d.room.trim();
  const block = d.block.trim();
  const landmark = d.landmark.trim();
  return [
    room && (/^room\b/i.test(room) ? room : `Room ${room}`),
    block && (/^(block|wing|tower)\b/i.test(block) ? block : `Block ${block}`),
    d.hostel.trim(),
    landmark && (/^(near|opp)/i.test(landmark) ? landmark : `Near ${landmark}`),
    `${city} ${d.pincode.trim()}`,
  ]
    .filter(Boolean)
    .join(", ");
}
