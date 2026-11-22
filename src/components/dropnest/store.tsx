import { createContext, useContext, useMemo, useState, type Context, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  KITS,
  cartTotals,
  formatINR,
  setItemQty,
  setItemAddonQty,
  setItemBrand,
  ITEMS_BY_ID,
  type AddonId,
  type CartState,
  type CartTotals,
  type City,
  type KitId,
} from "@/lib/dropnest";

export type View = "student" | "parent";

interface DropnestStore {
  view: View;
  toggleView: () => void;
  city: City;
  setCity: (c: City) => void;
  cart: CartState;
  totals: CartTotals;
  moveIn: string;
  setMoveIn: (v: string) => void;
  cartOpen: boolean;
  setCartOpen: (o: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (o: boolean) => void;
  quizOpen: boolean;
  setQuizOpen: (o: boolean) => void;
  addKit: (id: KitId, silent?: boolean) => void;
  buyNow: (id: KitId) => void;
  setKitQty: (id: KitId, qty: number) => void;
  setItem: (kitId: KitId, itemId: string, qty: number) => void;
  toggleAddon: (id: AddonId) => void;
  /** Buy a single item from a bigger kit as an add-on (0 removes it). */
  setItemAddon: (itemId: string, qty: number, kitId?: KitId) => void;
  /** Pick which brand of an item to get; applies everywhere that item appears. */
  setBrand: (itemId: string, brandId: string) => void;
  applyRecommendation: (kitId: KitId, addons: AddonId[]) => void;
  clearCart: () => void;
}

// Keep one context object across hot reloads; otherwise a reloaded store module
// creates a new context that the already-mounted provider in __root doesn't supply.
const CTX_KEY = "__dropnestStoreContext__";
const ctxHolder = globalThis as unknown as Record<string, Context<DropnestStore | null> | undefined>;
const Ctx: Context<DropnestStore | null> =
  ctxHolder[CTX_KEY] ?? (ctxHolder[CTX_KEY] = createContext<DropnestStore | null>(null));

const EMPTY_CART: CartState = { kits: {}, addons: [], extras: {}, items: {} };

/** Shared, in-memory shopping state so the cart follows the customer between pages. */
export function DropnestProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("student");
  const [city, setCity] = useState<City>("Kota");
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [moveIn, setMoveIn] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const totals = useMemo(() => cartTotals(cart), [cart]);

  const addKit = (id: KitId, silent = false) => {
    setCart((c) => ({ ...c, kits: { ...c.kits, [id]: (c.kits[id] ?? 0) + 1 } }));
    if (!silent)
      toast.success(`${KITS[id].name} added`, {
        description: `${KITS[id].items.length} items · ${formatINR(KITS[id].price)}`,
        action: { label: "View cart", onClick: () => setCartOpen(true) },
      });
  };

  const store: DropnestStore = {
    view,
    toggleView: () => setView((v) => (v === "student" ? "parent" : "student")),
    city,
    setCity,
    cart,
    totals,
    moveIn,
    setMoveIn,
    cartOpen,
    setCartOpen,
    checkoutOpen,
    setCheckoutOpen,
    quizOpen,
    setQuizOpen,
    addKit,
    buyNow: (id) => {
      if (!(cart.kits[id] ?? 0)) addKit(id, true);
      setCheckoutOpen(true);
    },
    setKitQty: (id, qty) =>
      setCart((c) => {
        const kits = { ...c.kits };
        const extras = { ...c.extras };
        if (qty <= 0) {
          delete kits[id];
          delete extras[id];
        } else kits[id] = qty;
        return { ...c, kits, extras };
      }),
    setItem: (kitId, itemId, qty) => {
      if (qty > 1 && !(cart.kits[kitId] ?? 0))
        toast.success(`${KITS[kitId].name} added`, {
          description: "With your extra item. Tap − to go back to 1.",
          action: { label: "View cart", onClick: () => setCartOpen(true) },
        });
      setCart((c) => setItemQty(c, kitId, itemId, qty));
    },
    setItemAddon: (itemId, qty, kitId) => {
      const before = cart.items?.[itemId] ?? 0;
      if (before === 0 && qty > 0) {
        const item = ITEMS_BY_ID[itemId];
        if (item)
          toast.success(`${item.name.split(" (")[0]} added`, {
            description: `+${formatINR(item.extraPrice)}`,
            action: { label: "View cart", onClick: () => setCartOpen(true) },
          });
      }
      setCart((c) => setItemAddonQty(c, itemId, qty, kitId));
    },
    toggleAddon: (id) =>
      setCart((c) => ({
        ...c,
        addons: c.addons.includes(id) ? c.addons.filter((a) => a !== id) : [...c.addons, id],
      })),
    setBrand: (itemId, brandId) => setCart((c) => setItemBrand(c, itemId, brandId)),
    applyRecommendation: (kitId, addons) => {
      setCart((c) => ({
        ...c,
        kits: c.kits[kitId] ? c.kits : { ...c.kits, [kitId]: 1 },
        addons: Array.from(new Set([...c.addons, ...addons])),
      }));
      setQuizOpen(false);
      setCheckoutOpen(true);
    },
    clearCart: () => {
      setCart(EMPTY_CART);
      setMoveIn("");
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useDropnest(): DropnestStore {
  const s = useContext(Ctx);
  if (!s) throw new Error("useDropnest must be used inside <DropnestProvider>");
  return s;
}

/** Scroll to a home-page section, or go back to the home page and land on it. */
export function useGoToSection() {
  const navigate = useNavigate();
  return (id: string) => {
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else void navigate({ to: "/", hash: id });
  };
}
