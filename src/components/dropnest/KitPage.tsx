import { Link } from "@tanstack/react-router";
import {
  Banknote,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import {
  AddonQtyControl,
  Footer,
  Header,
  ItemStepper,
  KIT_ICON,
  QtyStepper,
  TopBar,
  otherKitsLabel,
  selectClass,
} from "@/components/dropnest/DropnestApp";
import { BrandPicker } from "@/components/dropnest/BrandPicker";
import { pickedPhoto } from "@/components/dropnest/itemPhotos";
import { useDropnest } from "@/components/dropnest/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CITIES,
  KITS,
  KIT_ORDER,
  deliveryBadge,
  discountPercent,
  formatINR,
  itemLineQty,
  itemUnitPrice,
  kitBrandPicks,
  kitPriceWithBrands,
  kitExtraLines,
  kitExtrasTotal,
  kitItemGroups,
  itemAddonQty,
  itemSourceKit,
  kitUpgradeItems,
  topKitInCart,
  type City,
  type KitId,
} from "@/lib/dropnest";

const PROMISES = [
  { icon: Truck, title: "Free bulky shipping", text: "Straight to your hostel or PG gate." },
  { icon: Banknote, title: "₹0 COD fee", text: "Pay cash or UPI when the box arrives." },
  { icon: RefreshCw, title: "7-day replacement", text: "Anything damaged is swapped free." },
  { icon: Zap, title: "Lands 24h early", text: "Waiting for you before move-in day." },
];

export default function KitPage({ kitId }: { kitId: KitId }) {
  const {
    cart,
    city,
    setCity,
    totals,
    addKit,
    buyNow,
    setKitQty,
    setItem,
    setItemAddon,
    setCartOpen,
  } = useDropnest();
  const kit = KITS[kitId];
  const Icon = KIT_ICON[kitId];
  const qty = cart.kits[kitId] ?? 0;
  const badge = deliveryBadge(city);
  const groups = kitItemGroups(kitId);
  const extras = kitExtraLines(cart, kitId);
  const brandPicks = kitBrandPicks(cart, kitId);
  const pricePerKit = kitPriceWithBrands(cart, kitId);
  const mosaic = kit.items.slice(-9);
  const upgrades = kitUpgradeItems(kitId);
  const cartTop = topKitInCart(cart);
  /** A bigger kit already in the cart includes this item, so it can't be added on its own. */
  const coveredBy = (itemId: string): KitId | null =>
    cartTop && KITS[cartTop].items.some((it) => it.id === itemId) ? cartTop : null;

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground md:pb-0">
      <TopBar />
      <Header />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[820px] bg-hero"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[820px] bg-grid"
        />
        <main className="relative mx-auto max-w-6xl px-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 py-5 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link to="/" hash="kits" className="hover:text-foreground">
              Kits
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-semibold text-foreground">{kit.name}</span>
          </nav>

          <section className="grid gap-10 pb-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="self-start rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {mosaic.map((it, i) => (
                  <img
                    key={it.id}
                    src={pickedPhoto(cart, it.id)}
                    alt={it.name}
                    width={320}
                    height={320}
                    className="aspect-square w-full animate-fade-up rounded-2xl border border-border object-cover transition-transform duration-300 hover:-translate-y-1 hover:rotate-1"
                    style={{ animationDelay: `${i * 70}ms` }}
                  />
                ))}
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                <Icon className="size-4 text-primary" /> {kit.items.length} items · packed in 1 box
              </p>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                  Official Dropnest Kit
                </span>
                {kit.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground">
                    <Star className="size-3.5 fill-current" /> Most Popular
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{kit.name}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{kit.tagline}</p>

              <div className="mt-6 flex items-end gap-3">
                <span className="font-display text-5xl font-extrabold">{formatINR(kit.price)}</span>
                <span className="pb-1.5 text-lg text-muted-foreground line-through">
                  {formatINR(kit.originalPrice)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
              <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-success-soft px-2 py-1 text-sm font-bold text-success-ink">
                <Check className="size-4" /> You save {formatINR(kit.originalPrice - kit.price)} (
                {discountPercent(kit.price, kit.originalPrice)}% off)
              </p>
              {pricePerKit > kit.price && (
                <p className="mt-2 text-sm text-muted-foreground">
                  With your brand picks:{" "}
                  <span className="font-display text-lg font-bold text-foreground">
                    {formatINR(pricePerKit)}
                  </span>{" "}
                  per kit (+{formatINR(pricePerKit - kit.price)})
                </p>
              )}

              <div className="mt-6 rounded-2xl border border-border bg-card p-3">
                <label
                  htmlFor="kit-city"
                  className="flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground"
                >
                  <MapPin className="size-3.5" /> Delivering to
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative sm:w-44">
                    <select
                      id="kit-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value as City)}
                      className={selectClass}
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <span
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm",
                      badge.fast
                        ? "bg-success-soft text-success-ink"
                        : "bg-highlight-soft text-highlight-foreground",
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {qty > 0 ? (
                  <div className="flex flex-1 items-center gap-2">
                    <QtyStepper qty={qty} onChange={(q) => setKitQty(kitId, q)} label={kit.name} />
                    <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success-soft py-2.5 text-sm font-bold text-success-ink">
                      <CircleCheck className="size-4" /> In your cart
                    </span>
                  </div>
                ) : (
                  <Button variant="ink" size="xl" className="flex-1" onClick={() => addKit(kitId)}>
                    <ShoppingBag /> Add Kit to Cart
                  </Button>
                )}
                <Button variant="hero" size="xl" className="flex-1" onClick={() => buyNow(kitId)}>
                  Buy Now
                </Button>
              </div>

              {brandPicks.length > 0 && (
                <div className="mt-4 rounded-xl bg-primary-soft/60 px-4 py-3 text-sm">
                  <p className="font-bold">
                    Your brand picks: +{formatINR(pricePerKit - kit.price)} per kit
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {brandPicks.map((p) => (
                      <li key={p.item.id} className="flex justify-between gap-2">
                        <span className="truncate">
                          {p.brand.name} · {p.item.name.split(" (")[0]}
                        </span>
                        <span className="shrink-0 font-semibold">+{formatINR(p.brand.upcharge)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {extras.length > 0 && (
                <div className="mt-4 rounded-xl bg-primary-soft/60 px-4 py-3 text-sm">
                  <p className="font-bold">
                    Your extra items: +{formatINR(kitExtrasTotal(cart, kitId))}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {extras.map((l) => (
                      <li key={l.item.id}>
                        +{l.extra} {l.item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {PROMISES.map((p) => (
                  <li
                    key={p.title}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3"
                  >
                    <p.icon className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>
                      <span className="block text-sm font-bold">{p.title}</span>
                      <span className="block text-xs text-muted-foreground">{p.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="flex flex-wrap gap-2 border-y border-border py-4">
            {KIT_ORDER.map((id) => (
              <Link
                key={id}
                to="/kits/$kitId"
                params={{ kitId: id }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold",
                  id === kitId
                    ? "border-primary bg-primary-soft text-accent-foreground"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                {KITS[id].name} · {formatINR(KITS[id].price)}
              </Link>
            ))}
          </div>

          <section className="py-14">
            <h2 className="text-3xl font-extrabold sm:text-4xl">What's in the box</h2>
            <p className="mt-2 text-muted-foreground">
              Every item below comes in your {kit.name}. Pick the brand you like for each one, and
              tap + to add extra units.
            </p>
            {groups.map((g) => (
              <div key={g.title} className="mt-10">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <h3 className="text-xl font-extrabold">{g.title}</h3>
                    <p className="text-sm text-muted-foreground">{g.text}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                    {g.items.length} items
                  </span>
                </div>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((it) => {
                    const lineQty = itemLineQty(cart, kitId, it.id);
                    const unit = itemUnitPrice(cart, it.id);
                    return (
                      <li
                        key={it.id}
                        className="reveal group flex flex-col rounded-2xl border border-border bg-card p-3 shadow-soft transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-lift"
                      >
                        <div className="overflow-hidden rounded-xl">
                          <img
                            src={pickedPhoto(cart, it.id)}
                            alt={it.name}
                            loading="lazy"
                            width={320}
                            height={320}
                            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-3 font-semibold leading-snug">{it.name}</p>
                        <div className="flex-1">
                          <BrandPicker itemId={it.id} itemName={it.name} />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {it.qty} included
                            <br />
                            {lineQty > 1 ? (
                              <span className="font-bold text-primary">
                                +{lineQty - 1} extra · +{formatINR((lineQty - 1) * unit)}
                              </span>
                            ) : (
                              <>+{formatINR(unit)} per extra</>
                            )}
                          </span>
                          <ItemStepper
                            qty={lineQty}
                            onChange={(q) => setItem(kitId, it.id, q)}
                            label={it.name}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>

          {upgrades.length > 0 ? (
            <section id="add-from-other-kits" className="scroll-mt-24 border-t border-border py-14">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                Suggested add-ons
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Add items from {otherKitsLabel(kitId)}
              </h2>
              <p className="mt-2 text-muted-foreground">
                Want a few things from the bigger kits without upgrading? Add any of these{" "}
                {upgrades.length} items to your {kit.name}, one at a time.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upgrades.map((it) => {
                  const from = itemSourceKit(it.id);
                  const covered = coveredBy(it.id);
                  const q = itemAddonQty(cart, it.id);
                  return (
                    <li
                      key={it.id}
                      className={cn(
                        "group flex flex-col rounded-2xl border bg-card p-3 shadow-soft transition-shadow hover:shadow-lift",
                        q > 0 && !covered
                          ? "border-success ring-1 ring-success/40"
                          : "border-border",
                      )}
                    >
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={pickedPhoto(cart, it.id)}
                          alt={it.name}
                          loading="lazy"
                          width={320}
                          height={320}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-bold shadow-sm">
                          From {KITS[from].name}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold leading-snug">{it.name}</p>
                      <div className="flex-1">
                        {!covered && <BrandPicker itemId={it.id} itemName={it.name} baseLabel="Base" />}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {it.qty}
                          <br />
                          <span className="font-display text-base font-bold text-foreground">
                            +{formatINR(itemUnitPrice(cart, it.id))}
                          </span>
                        </span>
                        {covered ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs font-bold text-success-ink">
                            <CircleCheck className="size-3.5" /> In your {KITS[covered].name}
                          </span>
                        ) : (
                          <AddonQtyControl
                            qty={q}
                            onChange={(n) => setItemAddon(it.id, n, kitId)}
                            label={it.name}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : (
            <section className="border-t border-border py-10">
              <p className="flex items-center gap-2 text-muted-foreground">
                <CircleCheck className="size-5 text-success" /> The {kit.name} already includes
                every item from the other kits.
              </p>
            </section>
          )}
        </main>
      </div>
      <Footer />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{kit.name}</p>
            <p className="font-display text-lg font-bold leading-tight">{formatINR(pricePerKit)}</p>
          </div>
          {totals.itemCount > 0 ? (
            <Button variant="hero" size="xl" onClick={() => setCartOpen(true)}>
              <ShoppingBag /> View Cart
            </Button>
          ) : (
            <Button variant="hero" size="xl" onClick={() => addKit(kitId)}>
              <ShoppingBag /> Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
