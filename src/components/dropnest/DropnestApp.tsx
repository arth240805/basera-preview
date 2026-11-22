import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Banknote,
  BedDouble,
  BedSingle,
  BookOpen,
  Briefcase,
  Building2,
  UserRoundCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  ArrowRight,
  CircleCheck,
  CreditCard,
  Crown,
  GraduationCap,
  House,
  Landmark,
  Lock,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  PackageCheck,
  PartyPopper,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";

import heroImage from "@/assets/dropnest-room.jpg";
import { ITEM_PHOTOS } from "@/components/dropnest/itemPhotos";
import {
  CountUp,
  DeliveryRoute,
  DriftingBoxes,
  FloatingItem,
  ItemMarquee,
} from "@/components/dropnest/motion";
import { useDropnest, useGoToSection, type View } from "@/components/dropnest/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ADDONS,
  ADDON_ORDER,
  CHECKLIST,
  CHECKLIST_CATEGORIES,
  CITIES,
  KITS,
  KIT_ORDER,
  cartTotals,
  checklistProgress,
  deliveryBadge,
  discountPercent,
  earliestMoveInDate,
  formatINR,
  itemLineQty,
  kitExtraLines,
  kitExtrasTotal,
  setItemQty,
  isValidIndianPhone,
  itemAddonLines,
  itemAddonQty,
  itemSourceKit,
  suggestedItemAddons,
  topKitInCart,
  EMPTY_DELIVERY,
  formatDeliveryAddress,
  validateDeliveryDetails,
  type DeliveryDetails,
  planDelivery,
  recommendKit,
  type AddonId,
  type CartState,
  type City,
  type KitId,
  type KitItem,
  type Persona,
  type Priority,
  type QuizAnswers,
  type RoomType,
} from "@/lib/dropnest";

export const KIT_ICON: Record<KitId, typeof Package> = {
  basic: Package,
  standard: Sparkles,
  premium: Crown,
};

export const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-input bg-card px-3 pr-9 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const fieldClass = "h-11 rounded-xl bg-card";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toDateInput(d: Date) {
  return format(d, "yyyy-MM-dd");
}

/* ───────────────────────────── Root ───────────────────────────── */

export default function DropnestApp() {
  const {
    view,
    city,
    setCity,
    cart,
    totals,
    addKit,
    setKitQty,
    toggleAddon,
    setCartOpen,
    setQuizOpen,
  } = useDropnest();
  const [leadOpen, setLeadOpen] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground md:pb-0">
      <TopBar />
      <Header />
      <main>
        <Hero
          view={view}
          city={city}
          onCity={setCity}
          onExplore={() => scrollToId("kits")}
          onQuiz={() => setQuizOpen(true)}
        />
        <KitsSection cart={cart} onAdd={addKit} onQty={setKitQty} onToggleAddon={toggleAddon} />
        <HowItWorks />
        <ChecklistSection
          checked={checked}
          onToggle={(id) =>
            setChecked((s) => {
              const n = new Set(s);
              if (n.has(id)) n.delete(id);
              else n.add(id);
              return n;
            })
          }
          onReset={() => setChecked(new Set())}
          onSend={() => setLeadOpen(true)}
        />
        <B2BSection />
      </main>
      <Footer />

      {/* Sticky bottom CTA (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          {totals.itemCount > 0 ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  {totals.itemCount} in cart · FREE delivery
                </p>
                <p className="font-display text-lg font-bold leading-tight">
                  {formatINR(totals.total)}
                </p>
              </div>
              <Button variant="hero" size="xl" onClick={() => setCartOpen(true)}>
                <ShoppingBag /> View Cart
              </Button>
            </>
          ) : (
            <>
              <Button variant="line" size="xl" className="flex-1" onClick={() => setQuizOpen(true)}>
                <Sparkles /> Quiz
              </Button>
              <Button
                variant="hero"
                size="xl"
                className="flex-[2]"
                onClick={() => scrollToId("kits")}
              >
                Explore Kits · from {formatINR(KITS.basic.price)}
              </Button>
            </>
          )}
        </div>
      </div>

      <LeadDialog open={leadOpen} onOpenChange={setLeadOpen} packed={checked.size} />
    </div>
  );
}

/** Cart drawer, quiz, checkout and the desktop floating cart — shared by every page. */
export function DropnestOverlays() {
  const {
    cart,
    totals,
    city,
    setCity,
    moveIn,
    setMoveIn,
    cartOpen,
    setCartOpen,
    checkoutOpen,
    setCheckoutOpen,
    quizOpen,
    setQuizOpen,
    setKitQty,
    setItem,
    toggleAddon,
    applyRecommendation,
    clearCart,
  } = useDropnest();
  const goToSection = useGoToSection();
  return (
    <>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={`Open cart, ${totals.itemCount} items`}
        className="fixed bottom-6 right-6 z-40 hidden h-14 items-center gap-2 rounded-full bg-gradient-primary px-5 font-semibold text-primary-foreground shadow-cta transition-transform hover:scale-105 md:inline-flex"
      >
        <ShoppingBag className="size-5" />
        {totals.itemCount > 0 ? formatINR(totals.total) : "Cart"}
        {totals.itemCount > 0 && (
          <span
            key={totals.itemCount}
            className="absolute -right-1 -top-1 grid size-6 animate-pop place-items-center rounded-full bg-ink text-xs text-ink-foreground"
          >
            {totals.itemCount}
          </span>
        )}
      </button>

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        city={city}
        moveIn={moveIn}
        onMoveIn={setMoveIn}
        onQty={setKitQty}
        onItemQty={setItem}
        onToggleAddon={toggleAddon}
        onExplore={() => {
          setCartOpen(false);
          setTimeout(() => goToSection("kits"), 250);
        }}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      <QuizDialog open={quizOpen} onOpenChange={setQuizOpen} onApply={applyRecommendation} />
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cart}
        city={city}
        onCity={setCity}
        moveIn={moveIn}
        onMoveIn={setMoveIn}
        onPlaced={clearCart}
      />
    </>
  );
}

/* ───────────────────────────── Chrome ───────────────────────────── */

export function TopBar() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-ink-foreground sm:text-sm">
      <Truck className="mr-1.5 inline size-4 -translate-y-px animate-bob text-highlight" />
      FREE direct-to-hostel delivery in Kota, Pune, Delhi NCR, Bengaluru & Hyderabad
      <span className="hidden sm:inline"> · Cash on Delivery available</span>
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Dropnest home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-cta">
        <PackageCheck className="size-5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl font-extrabold tracking-tight">Dropnest</span>
        <span className="block text-[11px] font-medium text-muted-foreground">Move in. Done.</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { view, toggleView: onToggleView, totals, setCartOpen } = useDropnest();
  const cartCount = totals.itemCount;
  const onOpenCart = () => setCartOpen(true);
  const scrollToId = useGoToSection();
  return (
    <header
      id="top"
      className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          <button
            type="button"
            onClick={() => scrollToId("kits")}
            className="hover:text-foreground"
          >
            Kits
          </button>
          <button type="button" onClick={() => scrollToId("how")} className="hover:text-foreground">
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollToId("checklist")}
            className="hover:text-foreground"
          >
            Checklist
          </button>
          <button type="button" onClick={() => scrollToId("b2b")} className="hover:text-foreground">
            For PG Owners
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleView}
            aria-pressed={view === "parent"}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
              view === "parent"
                ? "border-success/40 bg-success-soft text-success-ink"
                : "border-border bg-card text-foreground hover:border-primary/40",
            )}
          >
            {view === "student" ? (
              <>
                <span className="hidden sm:inline">Switch to</span> Parent View 👨‍👩‍👦
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Switch to</span> Student View 🎓
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open cart, ${cartCount} items`}
            className="relative grid size-10 place-items-center rounded-full border border-border bg-card hover:border-primary/40"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="absolute -right-1 -top-1 grid size-5 animate-pop place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

const STUDENT_POINTS = [
  { icon: Package, title: "1 order, 1 box", text: "Up to 25 move-in essentials, packed together." },
  {
    icon: Wallet,
    title: "Save up to 39%",
    text: "Cheaper than buying piece-by-piece near campus.",
  },
  { icon: Truck, title: "Lands before you", text: "Delivered 24 hours ahead of your move-in." },
  { icon: ShieldCheck, title: "Hostel-tough", text: "Unbreakable, tested for shared-room life." },
];

const PARENT_POINTS = [
  {
    icon: Banknote,
    title: "100% Cash on Delivery",
    text: "Pay only when the box reaches the hostel.",
  },
  {
    icon: ShieldCheck,
    title: "Verified unbreakable materials",
    text: "Virgin plastic, steel & cotton — no flimsy fillers.",
  },
  {
    icon: Building2,
    title: "Delivered to the warden",
    text: "Handed to reception or warden before your child arrives.",
  },
  { icon: RefreshCw, title: "7-day replacement", text: "No-questions-asked swap on any item." },
];

function Hero({
  view,
  city,
  onCity,
  onExplore,
  onQuiz,
}: {
  view: View;
  city: City;
  onCity: (c: City) => void;
  onExplore: () => void;
  onQuiz: () => void;
}) {
  const badge = deliveryBadge(city);
  const points = view === "parent" ? PARENT_POINTS : STUDENT_POINTS;
  return (
    <section className="relative overflow-hidden bg-hero">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
            {view === "parent"
              ? "🛡️ Built for parents who worry"
              : "🎓 For students & first-time renters"}
          </span>
          <h1 className="mt-5 text-balance-safe text-4xl font-extrabold leading-[1.02] sm:text-5xl lg:text-6xl">
            Walk into an empty room. <span className="text-primary">Walk out with a home.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg lg:mt-5">
            {view === "parent"
              ? "One order, one box, delivered straight to the hostel. Everything your child needs for their PG room — bedding, bath, study and safety — paid on delivery."
              : "Skip the 6-shop scramble on day one. One order gets you one box with every PG and hostel essential — bedding, bath, study gear — waiting before you arrive."}
          </p>

          <div className="mt-7 max-w-md rounded-2xl border border-border bg-card p-3 shadow-soft">
            <Label
              htmlFor="hero-city"
              className="flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground"
            >
              <MapPin className="size-3.5" /> Where are you moving?
            </Label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative sm:w-44">
                <select
                  id="hero-city"
                  value={city}
                  onChange={(e) => onCity(e.target.value as City)}
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
                key={city}
                aria-live="polite"
                className={cn(
                  "inline-flex animate-fade-up items-center rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm",
                  badge.fast
                    ? "bg-success-soft text-success-ink"
                    : "bg-highlight-soft text-highlight-foreground",
                )}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mt-6">
            <Button variant="hero" size="xl" onClick={onExplore}>
              Explore Kits <ChevronDown />
            </Button>
            <Button variant="line" size="xl" onClick={onQuiz}>
              <Sparkles className="text-primary" /> Take 30-Sec Room Quiz
            </Button>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-sm lg:mt-7">
            <Clock className="h-4 w-4 shrink-0 text-highlight" />
            <span className="font-semibold">
              <CountUp key="h" to={24} suffix="h" />
            </span>
            <span className="text-muted-foreground">before your move-in</span>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="overflow-hidden rounded-[2rem] border border-border shadow-lift">
            <img
              src={heroImage}
              alt="A freshly set-up hostel room with bedding, study table, bucket and an opened Dropnest box"
              width={1280}
              height={1024}
              className="aspect-[5/4] w-full animate-ken-burns object-cover"
            />
          </div>
          <FloatingItem
            id="pillow"
            label="Pillow"
            tilt={-4}
            className="-left-8 top-[18%] hidden xl:flex"
          />
          <FloatingItem
            id="kettle"
            label="Kettle"
            tilt={3}
            delay={1400}
            className="-right-6 top-[42%] hidden md:flex"
          />
          <FloatingItem
            id="led-lamp"
            label="Study lamp"
            tilt={-3}
            delay={2800}
            className="-left-10 top-[58%] hidden xl:flex"
          />
          <div
            className="absolute -bottom-5 left-4 flex animate-float items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lift sm:left-6"
            style={{ animationDelay: "700ms", animationDuration: "7s" }}
          >
            <span className="relative grid size-10 place-items-center rounded-xl bg-success-soft text-success">
              <PackageCheck className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
            </span>
            <div>
              <p className="text-sm font-bold">Delivered to Room 204</p>
              <p className="text-xs text-muted-foreground">Signed by warden · 9:42 AM</p>
            </div>
          </div>
          <div
            className="absolute -top-4 right-4 hidden animate-float rounded-2xl bg-ink px-4 py-3 text-ink-foreground shadow-lift sm:block"
            style={{ animationDuration: "8s" }}
          >
            <p className="text-xs text-ink-muted">Standard Kit</p>
            <p className="font-display text-lg font-bold">
              19 items · {formatINR(KITS.standard.price)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-y border-border bg-card/80 backdrop-blur">
        <ul
          key={view}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-px px-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label={
            view === "parent" ? "Why parents trust Dropnest" : "Why students pick Dropnest"
          }
        >
          {points.map((p, i) => (
            <li
              key={p.title}
              className="flex animate-fade-up items-start gap-3 py-5 lg:px-4"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  view === "parent"
                    ? "bg-success-soft text-success"
                    : "bg-primary-soft text-primary",
                )}
              >
                <p.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ItemMarquee />
    </section>
  );
}

/* ───────────────────────────── Kits ───────────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
}) {
  return (
    <div className="reveal mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}

export function QtyStepper({
  qty,
  onChange,
  label,
}: {
  qty: number;
  onChange: (q: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex h-10 items-center rounded-xl border border-border bg-card">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(qty - 1)}
        className="grid h-full w-10 place-items-center text-muted-foreground hover:text-foreground"
      >
        {qty === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
      </button>
      <span className="w-6 text-center text-sm font-bold" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(qty + 1)}
        className="grid h-full w-10 place-items-center text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function ItemStepper({
  qty,
  onChange,
  label,
}: {
  qty: number;
  onChange: (q: number) => void;
  label: string;
}) {
  const atMin = qty <= 1;
  return (
    <div className="inline-flex h-8 shrink-0 items-center rounded-lg border border-border bg-card">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        disabled={atMin}
        title={atMin ? "1 comes with the kit" : undefined}
        onClick={() => onChange(qty - 1)}
        className="grid h-full w-8 place-items-center text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-bold" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label={`More ${label}`}
        onClick={() => onChange(qty + 1)}
        className="grid h-full w-8 place-items-center text-primary hover:text-foreground"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function ItemRow({
  item,
  qty,
  onQty,
  isNew,
  compact,
}: {
  item: KitItem;
  qty: number;
  onQty: (q: number) => void;
  isNew?: boolean;
  compact?: boolean;
}) {
  const extra = qty - 1;
  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2 odd:bg-muted/60">
      <img
        src={ITEM_PHOTOS[item.id]}
        alt={item.name}
        loading="lazy"
        width={320}
        height={320}
        className={cn(
          "shrink-0 rounded-lg border border-border bg-card object-cover",
          compact ? "size-11" : "size-14",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium leading-snug", compact ? "text-xs" : "text-sm")}>
          {item.name}
          {isNew && (
            <span className="ml-1.5 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
              New
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {item.qty} included
          {extra > 0 ? (
            <span className="font-bold text-primary">
              {" "}
              · +{extra} extra · +{formatINR(extra * item.extraPrice)}
            </span>
          ) : (
            <> · +{formatINR(item.extraPrice)} per extra</>
          )}
        </p>
      </div>
      <ItemStepper qty={qty} onChange={onQty} label={item.name} />
    </li>
  );
}

/** "Standard & Premium" for Basic, "Premium" for Standard. */
export function otherKitsLabel(kitId: KitId): string {
  const bigger = KIT_ORDER.slice(KIT_ORDER.indexOf(kitId) + 1).map((k) =>
    KITS[k].name.replace(" Kit", ""),
  );
  return bigger.join(" & ");
}

/** − / + for a single-item add-on. Unlike kit items, this one can go back to 0. */
export function AddonQtyControl({
  qty,
  onChange,
  label,
}: {
  qty: number;
  onChange: (q: number) => void;
  label: string;
}) {
  if (qty === 0)
    return (
      <Button
        variant="line"
        size="sm"
        className="shrink-0"
        onClick={() => onChange(1)}
        aria-label={`Add ${label}`}
      >
        <Plus className="size-3.5" /> Add
      </Button>
    );
  return (
    <div className="inline-flex h-8 shrink-0 items-center rounded-lg border border-success bg-success-soft">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        onClick={() => onChange(qty - 1)}
        className="grid h-full w-8 place-items-center text-success-ink hover:text-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-bold text-success-ink" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label={`More ${label}`}
        onClick={() => onChange(qty + 1)}
        className="grid h-full w-8 place-items-center text-success-ink hover:text-foreground"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** One item from a bigger kit, offered on its own. */
export function ItemAddonTile({
  item,
  qty,
  onQty,
  compact,
}: {
  item: KitItem;
  qty: number;
  onQty: (q: number) => void;
  compact?: boolean;
}) {
  const from = KITS[itemSourceKit(item.id)].name.replace(" Kit", "");
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border p-2 transition-colors",
        qty > 0 ? "border-success bg-success-soft/60" : "border-border bg-card",
      )}
    >
      <img
        src={ITEM_PHOTOS[item.id]}
        alt={item.name}
        loading="lazy"
        width={320}
        height={320}
        className={cn(
          "shrink-0 rounded-lg border border-border object-cover",
          compact ? "size-11" : "size-14",
        )}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn("line-clamp-2 font-semibold leading-snug", compact ? "text-xs" : "text-sm")}
        >
          {item.name}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{formatINR(item.extraPrice)}</span> · from{" "}
          {from}
        </p>
      </div>
      <AddonQtyControl qty={qty} onChange={onQty} label={item.name} />
    </li>
  );
}

/** Suggests every item from the other kits that the cart's kit doesn't include. */
function KitUpgradeSuggestions({ compact = false }: { compact?: boolean }) {
  const { cart, setItemAddon } = useDropnest();
  const [showAll, setShowAll] = useState(false);
  const top = topKitInCart(cart);
  const items = suggestedItemAddons(cart);
  if (!top) return null;
  if (items.length === 0)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-sm font-semibold text-success-ink">
        <CircleCheck className="size-4 shrink-0" /> Your {KITS[top].name} already has every item we
        make.
      </p>
    );
  const limit = compact ? 4 : 6;
  // Items already picked always stay visible, even past the short list.
  const shown = showAll
    ? items
    : items.filter((it, i) => i < limit || itemAddonQty(cart, it.id) > 0);
  return (
    <div>
      <p className={cn("font-display font-bold", compact ? "text-sm" : "text-lg")}>
        Complete your {KITS[top].name}
      </p>
      <p className="text-xs text-muted-foreground">
        {items.length} items from {otherKitsLabel(top)} — add just the ones you need.
      </p>
      <ul className={cn("mt-3 grid gap-2", !compact && "sm:grid-cols-2 lg:grid-cols-3")}>
        {shown.map((it) => (
          <ItemAddonTile
            key={it.id}
            compact={compact}
            item={it}
            qty={itemAddonQty(cart, it.id)}
            onQty={(q) => setItemAddon(it.id, q)}
          />
        ))}
      </ul>
      {items.length > limit && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
        >
          {showAll ? "Show fewer" : `Show all ${items.length} items`}
          <ChevronDown className={cn("size-3.5 transition-transform", showAll && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

function KitsSection({
  cart,
  onAdd,
  onQty,
  onToggleAddon,
}: {
  cart: CartState;
  onAdd: (id: KitId) => void;
  onQty: (id: KitId, q: number) => void;
  onToggleAddon: (id: AddonId) => void;
}) {
  return (
    <section id="kits" className="scroll-mt-20 bg-spotlight px-4 py-20">
      <SectionHeading
        eyebrow="Pick your kit"
        title="Three boxes. Zero shopping lists."
        text="Every kit ships free, arrives 24 hours before you do, and is covered by a 7-day replacement."
      />
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3 lg:items-start">
        {KIT_ORDER.map((id) => {
          const kit = KITS[id];
          const Icon = KIT_ICON[id];
          const qty = cart.kits[id] ?? 0;
          return (
            <article
              key={id}
              className={cn(
                "reveal relative flex flex-col rounded-3xl border bg-card p-6 shadow-soft transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-lift",
                kit.popular
                  ? "border-highlight bg-popular ring-2 ring-highlight/40 lg:-mt-4"
                  : "border-border",
              )}
            >
              {kit.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 overflow-hidden rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground shadow-sm">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-highlight-foreground/30"
                  />
                  <Star className="size-3.5 fill-current" /> Most Popular
                </span>
              )}
              <Link
                to="/kits/$kitId"
                params={{ kitId: id }}
                className="group -m-2 block rounded-2xl p-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                    {kit.items.length} items
                  </span>
                </div>
                <div className="mt-4 flex -space-x-3 transition-all group-hover:-space-x-1">
                  {kit.items.slice(-5).map((it) => (
                    <img
                      key={it.id}
                      src={ITEM_PHOTOS[it.id]}
                      alt=""
                      loading="lazy"
                      width={320}
                      height={320}
                      className="size-12 rounded-full border-2 border-card object-cover shadow-sm transition-[margin,translate] duration-300 group-hover:-translate-y-0.5"
                    />
                  ))}
                  <span className="grid size-12 place-items-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-secondary-foreground">
                    +{kit.items.length - 5}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold group-hover:text-primary">
                  {kit.name}
                </h3>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">{kit.tagline}</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="font-display text-4xl font-extrabold">
                    {formatINR(kit.price)}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground line-through">
                    {formatINR(kit.originalPrice)}
                  </span>
                </div>
                <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-success-soft px-2 py-1 text-xs font-bold text-success-ink">
                  <Check className="size-3.5" /> You save {formatINR(kit.originalPrice - kit.price)}{" "}
                  ({discountPercent(kit.price, kit.originalPrice)}% off)
                </p>
              </Link>

              <div className="mt-6">
                {qty > 0 ? (
                  <div className="flex items-center gap-2">
                    <QtyStepper qty={qty} onChange={(q) => onQty(id, q)} label={kit.name} />
                    <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success-soft py-2.5 text-sm font-bold text-success-ink">
                      <CircleCheck className="size-4" /> In your cart
                    </span>
                  </div>
                ) : (
                  <Button
                    variant={kit.popular ? "hero" : "ink"}
                    size="xl"
                    className="w-full"
                    onClick={() => onAdd(id)}
                  >
                    <ShoppingBag /> Add Kit to Cart
                  </Button>
                )}
              </div>

              <Link
                to="/kits/$kitId"
                params={{ kitId: id }}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-primary-soft"
              >
                View Complete Kit · all {kit.items.length} items
                <ArrowRight className="size-4" />
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="lg:w-56">
            <p className="font-display text-lg font-bold">Popular Add-Ons</p>
            <p className="text-sm text-muted-foreground">One tap to add or remove.</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {ADDON_ORDER.map((aid) => {
              const a = ADDONS[aid];
              const on = cart.addons.includes(aid);
              return (
                <button
                  key={aid}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    onToggleAddon(aid);
                    toast(on ? `${a.name} removed` : `${a.name} added`, {
                      description: on ? undefined : `+${formatINR(a.price)}`,
                    });
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    on ? "border-success bg-success-soft" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="relative shrink-0">
                    <img
                      src={ITEM_PHOTOS[aid]}
                      alt=""
                      loading="lazy"
                      width={320}
                      height={320}
                      className="size-12 rounded-xl border border-border object-cover"
                    />
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full ring-2 ring-card",
                        on ? "bg-success text-success-foreground" : "bg-secondary text-foreground",
                      )}
                    >
                      {on ? <Check className="size-3" /> : <Plus className="size-3" />}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{a.name}</span>
                    <span className="block text-xs text-muted-foreground">{a.note}</span>
                  </span>
                  <span className="text-sm font-bold">+{formatINR(a.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
        {topKitInCart(cart) && (
          <div className="mt-5 border-t border-border pt-5">
            <KitUpgradeSuggestions />
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────────── How it works ───────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      icon: ShoppingBag,
      title: "Pick a kit",
      text: "Choose Basic, Standard or Premium — or let the quiz pick.",
    },
    {
      icon: CalendarDays,
      title: "Tell us your move-in date",
      text: "We time dispatch so it lands a day before you.",
    },
    {
      icon: Building2,
      title: "We deliver to the hostel",
      text: "Handed to the warden or reception, signed for.",
    },
    {
      icon: House,
      title: "Walk in. Unbox. Done.",
      text: "Bed made, desk set up, bucket filled — in an hour.",
    },
  ];
  return (
    <section id="how" className="scroll-mt-20 bg-secondary/60 px-4 py-20">
      <SectionHeading eyebrow="How it works" title="From checkout to cosy in four steps." />
      <DeliveryRoute />
      <ol className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:mt-6 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="reveal rounded-3xl border border-border bg-card p-6 shadow-soft transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <s.icon className="size-5" />
              </span>
              <span className="font-display text-4xl font-extrabold text-border">0{i + 1}</span>
            </div>
            <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────────────────────── Checklist ───────────────────────────── */

function ChecklistSection({
  checked,
  onToggle,
  onReset,
  onSend,
}: {
  checked: Set<string>;
  onToggle: (id: string) => void;
  onReset: () => void;
  onSend: () => void;
}) {
  const pct = checklistProgress(checked.size);
  return (
    <section id="checklist" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Free move-in checklist
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            The 12 things people forget to pack.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tick them off as you pack. Our kits cover the room — this covers the rest of your bag.
          </p>
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold" aria-live="polite">
                {checked.size} / {CHECKLIST.length} items packed — {pct}%
              </p>
              {checked.size > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
            <div
              className="mt-3 h-3 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Packing progress"
            >
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {pct === 100
                ? "🎉 Fully packed. You're ready to move in."
                : "Keep going — you can send the list to yourself anytime."}
            </p>
            <Button
              variant="trust"
              size="xl"
              className="mt-5 w-full whitespace-normal text-center"
              onClick={onSend}
            >
              <MessageCircle /> Send My Checklist & Packing Guide to WhatsApp
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CHECKLIST_CATEGORIES.map((cat) => {
            const items = CHECKLIST.filter((c) => c.category === cat);
            const done = items.filter((i) => checked.has(i.id)).length;
            return (
              <fieldset
                key={cat}
                className="rounded-3xl border border-border bg-card p-5 shadow-soft"
              >
                <legend className="sr-only">{cat}</legend>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-display text-lg font-bold">{cat}</p>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      done === items.length ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {done}/{items.length}
                  </span>
                </div>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const on = checked.has(item.id);
                    return (
                      <li key={item.id}>
                        <label
                          htmlFor={`chk-${item.id}`}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted",
                            on && "text-muted-foreground line-through",
                          )}
                        >
                          <Checkbox
                            id={`chk-${item.id}`}
                            checked={on}
                            onCheckedChange={() => onToggle(item.id)}
                            className="size-5 rounded-md border-input data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground"
                          />
                          {item.label}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LeadDialog({
  open,
  onOpenChange,
  packed,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  packed: number;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (name.trim().length < 2) err["name"] = "Please enter your name.";
    if (!isValidIndianPhone(phone)) err["phone"] = "Enter a valid 10-digit Indian mobile number.";
    if (!date) err["date"] = "Pick your move-in date.";
    setErrors(err);
    if (Object.keys(err).length === 0) setSent(true);
  };

  const handleOpen = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => setSent(false), 250);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md rounded-3xl">
        {sent ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid size-14 animate-pop place-items-center rounded-full bg-success-soft text-success">
              <CircleCheck className="size-7" />
            </span>
            <DialogTitle className="mt-4 font-display text-2xl">
              Checklist on its way, {name.split(" ")[0]}!
            </DialogTitle>
            <DialogDescription className="mt-2">
              We'll WhatsApp your 12-item checklist and packing guide to {phone}. Moving in{" "}
              {date ? format(parseISO(date), "d MMM yyyy") : ""} — you've packed {packed} of{" "}
              {CHECKLIST.length} so far.
            </DialogDescription>
            <Button
              variant="ink"
              size="xl"
              className="mt-6 w-full"
              onClick={() => handleOpen(false)}
            >
              Back to packing
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <span className="mb-2 grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
                <MessageCircle className="size-6" />
              </span>
              <DialogTitle className="font-display text-2xl">
                Get the checklist on WhatsApp
              </DialogTitle>
              <DialogDescription>
                Plus our room-by-room packing guide. No spam, ever.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-4">
              <Field label="Student name" error={errors["name"]} htmlFor="lead-name">
                <Input
                  id="lead-name"
                  className={fieldClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                />
              </Field>
              <Field label="WhatsApp number" error={errors["phone"]} htmlFor="lead-phone">
                <Input
                  id="lead-phone"
                  className={fieldClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Move-in date" error={errors["date"]} htmlFor="lead-date">
                <Input
                  id="lead-date"
                  type="date"
                  className={fieldClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
            </div>
            <Button type="submit" variant="trust" size="xl" className="mt-6 w-full">
              <MessageCircle /> Send to WhatsApp
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

/* ───────────────────────────── B2B ───────────────────────────── */

function B2BSection() {
  const [form, setForm] = useState({
    name: "",
    role: "PG Owner",
    property: "",
    city: "Kota",
    rooms: "",
    request: "sample" as "sample" | "bulk",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ref, setRef] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err["name"] = "Enter your name.";
    if (form.property.trim().length < 2) err["property"] = "Enter the property name.";
    const rooms = Number(form.rooms);
    if (!Number.isInteger(rooms) || rooms < 1) err["rooms"] = "Enter number of rooms.";
    if (!isValidIndianPhone(form.phone)) err["phone"] = "Enter a valid 10-digit mobile.";
    setErrors(err);
    if (Object.keys(err).length === 0)
      setRef(`B2B-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  };

  return (
    <section
      id="b2b"
      className="relative scroll-mt-20 overflow-hidden bg-ink px-4 py-20 text-ink-foreground"
    >
      <DriftingBoxes />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-highlight">
            For PG owners & wardens
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Fit out 10 rooms or 500. Same box, same day.
          </h2>
          <p className="mt-4 text-ink-muted">
            Order a sample kit to inspect, or let us fit out every room before the batch arrives.
            Popular with coaching hostels in Kota, student PGs in Pune and co-living in Delhi NCR.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Bulk pricing and GST invoice",
              "Room-wise delivery and setup on request",
              "Dedicated account manager for your property",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-card p-6 text-card-foreground shadow-lift sm:p-8">
          {ref ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid size-14 animate-pop place-items-center rounded-full bg-success-soft text-success">
                <CircleCheck className="size-7" />
              </span>
              <h3 className="mt-4 text-2xl font-extrabold">Request received</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks {form.name.split(" ")[0]} — our B2B team will call {form.phone} within one
                working day about{" "}
                {form.request === "sample" ? "a sample kit" : `fitting out ${form.rooms} rooms`} at{" "}
                {form.property}, {form.city}.
              </p>
              <p className="mt-4 inline-block rounded-lg bg-secondary px-3 py-1.5 font-mono text-sm font-bold">
                {ref}
              </p>
              <div>
                <Button variant="line" className="mt-6" onClick={() => setRef(null)}>
                  Send another enquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
                {(
                  [
                    ["sample", "Order a sample kit"],
                    ["bulk", "Bulk room fit-out"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={form.request === v}
                    onClick={() => set("request", v)}
                    className={cn(
                      "rounded-xl py-2.5 text-sm font-semibold transition-colors",
                      form.request === v ? "bg-card shadow-soft" : "text-muted-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" error={errors["name"]} htmlFor="b2b-name">
                  <Input
                    id="b2b-name"
                    className={fieldClass}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Rakesh Meena"
                  />
                </Field>
                <Field label="You are a" htmlFor="b2b-role">
                  <div className="relative">
                    <select
                      id="b2b-role"
                      className={selectClass}
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                    >
                      <option>PG Owner</option>
                      <option>Hostel Warden</option>
                      <option>Co-living Operator</option>
                      <option>Coaching Institute</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <Field label="Property name" error={errors["property"]} htmlFor="b2b-prop">
                  <Input
                    id="b2b-prop"
                    className={fieldClass}
                    value={form.property}
                    onChange={(e) => set("property", e.target.value)}
                    placeholder="Shree Residency PG"
                  />
                </Field>
                <Field label="City" htmlFor="b2b-city">
                  <div className="relative">
                    <select
                      id="b2b-city"
                      className={selectClass}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    >
                      {CITIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <Field label="Number of rooms" error={errors["rooms"]} htmlFor="b2b-rooms">
                  <Input
                    id="b2b-rooms"
                    type="number"
                    min={1}
                    className={fieldClass}
                    value={form.rooms}
                    onChange={(e) => set("rooms", e.target.value)}
                    placeholder="40"
                  />
                </Field>
                <Field label="Phone" error={errors["phone"]} htmlFor="b2b-phone">
                  <Input
                    id="b2b-phone"
                    className={fieldClass}
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="98290 12345"
                  />
                </Field>
              </div>
              <Field label="Anything else? (optional)" htmlFor="b2b-notes">
                <Textarea
                  id="b2b-notes"
                  className="rounded-xl bg-card"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Batch arrives 1 July, need kits in 3 blocks…"
                />
              </Field>
              <Button type="submit" variant="hero" size="xl" className="w-full">
                <Building2 />{" "}
                {form.request === "sample" ? "Request Sample Kit" : "Request Bulk Quote"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-10 md:pb-28">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <Logo />
        <p className="text-sm text-muted-foreground">
          Delivering to Kota · Pune · Delhi NCR · Bengaluru · Hyderabad · Mumbai and beyond.
        </p>
        <p className="text-xs text-muted-foreground">© {2026} Dropnest. Move in. Done.</p>
      </div>
    </footer>
  );
}

/* ───────────────────────────── Cart drawer ───────────────────────────── */

function PriceSummary({ cart }: { cart: CartState }) {
  const t = cartTotals(cart);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-semibold">{formatINR(t.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Bulky Shipping</dt>
        <dd className="font-bold text-success">FREE</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">COD fee</dt>
        <dd className="font-semibold">{formatINR(t.codFee)}</dd>
      </div>
      {t.savings > 0 && (
        <div className="flex justify-between rounded-lg bg-success-soft px-2 py-1.5 text-success-ink">
          <dt className="font-semibold">You save</dt>
          <dd className="font-bold">{formatINR(t.savings)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-3 text-base">
        <dt className="font-bold">Total</dt>
        <dd className="font-display text-xl font-extrabold">{formatINR(t.total)}</dd>
      </div>
    </dl>
  );
}

function MoveInPicker({
  city,
  moveIn,
  onMoveIn,
  id,
}: {
  city: City;
  moveIn: string;
  onMoveIn: (v: string) => void;
  id: string;
}) {
  const [today] = useState(() => new Date());
  const min = toDateInput(earliestMoveInDate(city, today));
  const plan = moveIn ? planDelivery(city, parseISO(moveIn), today) : null;
  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-4">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-bold">
        <CalendarDays className="size-4 text-primary" /> Select Move-in Date
      </Label>
      <Input
        id={id}
        type="date"
        min={min}
        value={moveIn}
        onChange={(e) => onMoveIn(e.target.value)}
        className="mt-2 h-11 rounded-xl bg-card"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        📦 We will dispatch your kit to arrive 24 hours before your move-in date.
      </p>
      {plan &&
        (plan.feasible ? (
          <p className="mt-2 rounded-lg bg-success-soft px-2.5 py-2 text-xs font-semibold text-success-ink">
            Dispatch {format(plan.dispatchDate, "EEE, d MMM")} → arrives{" "}
            {format(plan.arrivalDate, "EEE, d MMM")} in {city}
          </p>
        ) : (
          <p className="mt-2 rounded-lg bg-highlight-soft px-2.5 py-2 text-xs font-semibold text-highlight-foreground">
            Too soon for {city}. Earliest move-in we can make is {format(parseISO(min), "d MMM")}.
          </p>
        ))}
    </div>
  );
}

function CartDrawer({
  open,
  onOpenChange,
  cart,
  city,
  moveIn,
  onMoveIn,
  onQty,
  onItemQty,
  onToggleAddon,
  onExplore,
  onCheckout,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cart: CartState;
  city: City;
  moveIn: string;
  onMoveIn: (v: string) => void;
  onQty: (id: KitId, q: number) => void;
  onItemQty: (kitId: KitId, itemId: string, q: number) => void;
  onToggleAddon: (id: AddonId) => void;
  onExplore: () => void;
  onCheckout: () => void;
}) {
  const [expanded, setExpanded] = useState<KitId | null>(null);
  const t = cartTotals(cart);
  const kitIds = KIT_ORDER.filter((id) => (cart.kits[id] ?? 0) > 0);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="font-display text-2xl font-extrabold">Your move-in box</SheetTitle>
          <SheetDescription>
            {t.itemCount > 0
              ? `${t.itemCount} item${t.itemCount > 1 ? "s" : ""} · delivering to ${city}`
              : "Nothing here yet."}
          </SheetDescription>
        </SheetHeader>

        {t.itemCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
              <Package className="size-8" />
            </span>
            <p className="mt-4 font-display text-xl font-bold">Your box is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a kit and we'll pack the rest.
            </p>
            <Button variant="hero" size="xl" className="mt-6" onClick={onExplore}>
              Explore Kits
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {kitIds.map((id) => {
                const kit = KITS[id];
                const Icon = KIT_ICON[id];
                const qty = cart.kits[id] ?? 0;
                return (
                  <div key={id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/kits/$kitId"
                          params={{ kitId: id }}
                          onClick={() => onOpenChange(false)}
                          className="font-bold hover:text-primary hover:underline"
                        >
                          {kit.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {kit.items.length} items ·{" "}
                          <span className="line-through">{formatINR(kit.originalPrice)}</span>
                        </p>
                      </div>
                      <p className="font-display font-bold">
                        {formatINR(kit.price * qty + kitExtrasTotal(cart, id))}
                      </p>
                    </div>
                    {kitExtraLines(cart, id).length > 0 && (
                      <ul className="mt-2 space-y-0.5 rounded-lg bg-primary-soft/60 px-3 py-2 text-xs">
                        {kitExtraLines(cart, id).map((l) => (
                          <li key={l.item.id} className="flex justify-between gap-2">
                            <span className="truncate">
                              +{l.extra} extra {l.item.name}
                            </span>
                            <span className="shrink-0 font-semibold">+{formatINR(l.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <QtyStepper qty={qty} onChange={(q) => onQty(id, q)} label={kit.name} />
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => (e === id ? null : id))}
                        aria-expanded={expanded === id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                      >
                        {expanded === id ? "Hide" : "View"} items
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform",
                            expanded === id && "rotate-180",
                          )}
                        />
                      </button>
                    </div>
                    {expanded === id && (
                      <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto border-t border-border pt-3">
                        {kit.items.map((it) => (
                          <ItemRow
                            key={it.id}
                            compact
                            item={it}
                            qty={itemLineQty(cart, id, it.id)}
                            onQty={(q) => onItemQty(id, it.id, q)}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Add-ons
                </p>
                <div className="space-y-2">
                  {ADDON_ORDER.map((aid) => {
                    const a = ADDONS[aid];
                    const on = cart.addons.includes(aid);
                    return (
                      <button
                        key={aid}
                        type="button"
                        aria-pressed={on}
                        onClick={() => onToggleAddon(aid)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm",
                          on ? "border-success bg-success-soft" : "border-dashed border-border",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-full",
                            on ? "bg-success text-success-foreground" : "bg-secondary",
                          )}
                        >
                          {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                        </span>
                        <span className="flex-1 font-semibold">{a.name}</span>
                        <span className="font-bold">+{formatINR(a.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border p-3">
                <KitUpgradeSuggestions compact />
              </div>

              <MoveInPicker id="cart-movein" city={city} moveIn={moveIn} onMoveIn={onMoveIn} />
            </div>

            <div className="border-t border-border bg-card px-6 py-5">
              <PriceSummary cart={cart} />
              <Button variant="hero" size="xl" className="mt-4 w-full" onClick={onCheckout}>
                <Lock /> Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ───────────────────────────── Quiz ───────────────────────────── */

interface QuizOption<T extends string> {
  value: T;
  label: string;
  hint: string;
  icon: typeof Package;
}

const PERSONAS: QuizOption<Persona>[] = [
  {
    value: "hostel",
    label: "Hostel Student",
    hint: "College hostel or campus PG",
    icon: GraduationCap,
  },
  { value: "aspirant", label: "Coaching Aspirant", hint: "JEE / NEET / UPSC prep", icon: BookOpen },
  {
    value: "professional",
    label: "First-Job Professional",
    hint: "New city, new job",
    icon: Briefcase,
  },
];
const ROOMS: QuizOption<RoomType>[] = [
  { value: "single", label: "Single PG Room", hint: "Just you, one bed", icon: BedSingle },
  { value: "shared", label: "Shared Double / Triple", hint: "Roommates included", icon: BedDouble },
  { value: "flat", label: "Rented 1BHK Flat", hint: "Your own kitchen", icon: House },
];
const PRIORITIES: QuizOption<Priority>[] = [
  { value: "budget", label: "Lowest Budget", hint: "Just the essentials", icon: Wallet },
  { value: "productivity", label: "Maximum Productivity", hint: "Study-ready setup", icon: Zap },
  { value: "luxury", label: "Luxury Comfort", hint: "Everything, sorted", icon: Crown },
];

function QuizDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply: (kit: KitId, addons: AddonId[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [addons, setAddons] = useState<AddonId[]>([]);

  const rec = useMemo(
    () =>
      answers.persona && answers.room && answers.priority
        ? recommendKit(answers as QuizAnswers)
        : null,
    [answers],
  );

  const reset = () => {
    setStep(0);
    setAnswers({});
    setAddons([]);
  };
  const handleOpen = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 250);
  };

  const pick = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (key === "priority" && next.persona && next.room) {
      setAddons(recommendKit(next as QuizAnswers).addons);
    }
    setTimeout(() => setStep((s) => Math.min(s + 1, 3)), 160);
  };

  const steps: { title: string; key: keyof QuizAnswers; options: QuizOption<string>[] }[] = [
    { title: "Who is this for?", key: "persona", options: PERSONAS },
    { title: "What room type?", key: "room", options: ROOMS },
    { title: "What matters most?", key: "priority", options: PRIORITIES },
  ];

  const current = step < 3 ? steps[step] : undefined;
  const kit = rec ? KITS[rec.kitId] : null;
  const total = kit ? kit.price + addons.reduce((s, id) => s + ADDONS[id].price, 0) : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl">
        <div className="flex items-center gap-3 pr-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Back"
              className="grid size-8 place-items-center rounded-full bg-secondary"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of 4`}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-secondary",
                )}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{step + 1}/4</span>
        </div>

        {current ? (
          <div key={step} className="animate-fade-up">
            <DialogHeader className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Find my kit</p>
              <DialogTitle className="font-display text-2xl font-extrabold">
                {current.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Choose one option to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-3">
              {current.options.map((o) => {
                const selected = answers[current.key] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => pick(current.key, o.value as never)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:border-primary/50",
                      selected ? "border-primary bg-primary-soft" : "border-border bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-xl",
                        selected ? "bg-primary text-primary-foreground" : "bg-secondary",
                      )}
                    >
                      <o.icon className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold">{o.label}</span>
                      <span className="block text-xs text-muted-foreground">{o.hint}</span>
                    </span>
                    {selected && <Check className="size-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          rec &&
          kit && (
            <div className="animate-fade-up">
              <DialogHeader className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-success">
                  Your perfect match
                </p>
                <DialogTitle className="font-display text-3xl font-extrabold">
                  {kit.name}
                </DialogTitle>
                <DialogDescription>{rec.reason}</DialogDescription>
              </DialogHeader>
              <div className="mt-5 rounded-2xl border border-border bg-popular p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kit.items.length} items</p>
                    <p className="font-display text-3xl font-extrabold">{formatINR(kit.price)}</p>
                  </div>
                  <span className="rounded-lg bg-success-soft px-2.5 py-1.5 text-sm font-bold text-success-ink">
                    Save {formatINR(rec.savings)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  MRP <span className="line-through">{formatINR(kit.originalPrice)}</span> ·{" "}
                  {discountPercent(kit.price, kit.originalPrice)}% off
                </p>
              </div>
              <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recommended add-ons
              </p>
              <div className="space-y-2">
                {ADDON_ORDER.map((aid) => {
                  const a = ADDONS[aid];
                  const on = addons.includes(aid);
                  return (
                    <label
                      key={aid}
                      htmlFor={`quiz-${aid}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
                        on ? "border-success bg-success-soft" : "border-border",
                      )}
                    >
                      <Checkbox
                        id={`quiz-${aid}`}
                        checked={on}
                        onCheckedChange={() =>
                          setAddons((l) =>
                            l.includes(aid) ? l.filter((x) => x !== aid) : [...l, aid],
                          )
                        }
                        className="size-5 rounded-md border-input data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground"
                      />
                      <span className="flex-1 font-semibold">{a.name}</span>
                      <span className="font-bold">+{formatINR(a.price)}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total · FREE delivery</span>
                <span className="font-display text-2xl font-extrabold">{formatINR(total)}</span>
              </div>
              <Button
                variant="hero"
                size="xl"
                className="mt-4 w-full"
                onClick={() => onApply(rec.kitId, addons)}
              >
                <ShoppingBag /> Add to Cart & Checkout
              </Button>
              <button
                type="button"
                onClick={reset}
                className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Retake quiz
              </button>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────────── Checkout ───────────────────────────── */

type PayMethod = "upi" | "card" | "netbanking" | "cod";

const PAY_METHODS: { id: PayMethod; label: string; icon: typeof Package }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Cards", icon: CreditCard },
  { id: "netbanking", label: "NetBanking", icon: Landmark },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

const BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak", "Bank of Baroda"];

interface PlacedOrder {
  id: string;
  total: number;
  method: PayMethod;
  kitNames: string[];
  addonNames: string[];
  name: string;
  address: string;
  contact: string;
  moveIn: string;
  arrival: string;
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </legend>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function TextField({
  id,
  label,
  error,
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "tel" | "numeric" | "text";
}) {
  return (
    <Field label={label} error={error} htmlFor={id}>
      <Input
        id={id}
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={100}
      />
    </Field>
  );
}

function CheckoutDialog({
  open,
  onOpenChange,
  cart,
  city,
  onCity,
  moveIn,
  onMoveIn,
  onPlaced,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cart: CartState;
  city: City;
  onCity: (c: City) => void;
  moveIn: string;
  onMoveIn: (v: string) => void;
  onPlaced: () => void;
}) {
  const scrollToId = useGoToSection();
  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [d, setD] = useState<DeliveryDetails>(EMPTY_DELIVERY);
  const setField = (k: keyof DeliveryDetails, v: string) => setD((p) => ({ ...p, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<PayMethod>("upi");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [bank, setBank] = useState("");
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [today] = useState(() => new Date());

  const t = cartTotals(cart);

  const handleOpen = (o: boolean) => {
    if (processing) return;
    onOpenChange(o);
    if (!o)
      setTimeout(() => {
        setStep("details");
        setErrors({});
        setOrder(null);
      }, 250);
  };

  const submitDetails = (e: FormEvent) => {
    e.preventDefault();
    const err = validateDeliveryDetails(d);
    if (!moveIn) err["moveIn"] = "Pick your move-in date.";
    else if (!planDelivery(city, parseISO(moveIn), today).feasible)
      err["moveIn"] = `That date is too soon for ${city}.`;
    setErrors(err);
    if (Object.keys(err).length === 0) setStep("payment");
  };

  const pay = () => {
    const err: Record<string, string> = {};
    if (method === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim()))
      err["upi"] = "Enter a valid UPI ID, e.g. name@okaxis.";
    if (method === "card") {
      if (card.number.replace(/\s/g, "").length !== 16)
        err["number"] = "Enter the 16-digit card number.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) err["expiry"] = "MM/YY";
      if (!/^\d{3}$/.test(card.cvv)) err["cvv"] = "3 digits";
      if (card.name.trim().length < 2) err["cardName"] = "Name on card";
    }
    if (method === "netbanking" && !bank) err["bank"] = "Choose your bank.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setProcessing(true);
    setTimeout(() => {
      const plan = planDelivery(city, parseISO(moveIn), today);
      setOrder({
        id: `DN-${Date.now().toString().slice(-6)}`,
        total: t.total,
        method,
        kitNames: KIT_ORDER.filter((id) => (cart.kits[id] ?? 0) > 0).map((id) => {
          const extras = kitExtraLines(cart, id)
            .map((l) => `+${l.extra} ${l.item.name.split(" (")[0]}`)
            .join(", ");
          return `${KITS[id].name} × ${cart.kits[id]}${extras ? ` (${extras})` : ""}`;
        }),
        addonNames: [
          ...itemAddonLines(cart).map((l) => `${l.item.name.split(" (")[0]} × ${l.qty}`),
          ...cart.addons.map((a) => ADDONS[a].name),
        ],
        name: d.name,
        address: formatDeliveryAddress(d, city),
        contact: `${d.contactName.trim()} · ${d.altPhone.trim()}`,
        moveIn: format(parseISO(moveIn), "EEE, d MMM yyyy"),
        arrival: format(plan.arrivalDate, "EEE, d MMM"),
      });
      setProcessing(false);
      setStep("done");
      onPlaced();
    }, 1400);
  };

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const empty = t.itemCount === 0 && step !== "done";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[94vh] max-w-xl overflow-y-auto rounded-3xl p-0">
        {step !== "done" && (
          <div className="flex items-center gap-2 border-b border-border px-6 py-4 pr-12 text-xs font-semibold">
            <span
              className={cn(
                "rounded-full px-2.5 py-1",
                step === "details"
                  ? "bg-primary text-primary-foreground"
                  : "bg-success-soft text-success-ink",
              )}
            >
              1 · Delivery
            </span>
            <span className="h-px w-6 bg-border" />
            <span
              className={cn(
                "rounded-full px-2.5 py-1",
                step === "payment"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              2 · Payment
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
              <Lock className="size-3" /> Secure
            </span>
          </div>
        )}

        <div className="p-6">
          {empty ? (
            <div className="py-8 text-center">
              <DialogTitle className="font-display text-xl">Your cart is empty</DialogTitle>
              <DialogDescription className="mt-2">Add a kit to start checkout.</DialogDescription>
              <Button
                variant="hero"
                className="mt-5"
                onClick={() => {
                  handleOpen(false);
                  setTimeout(() => scrollToId("kits"), 250);
                }}
              >
                Explore Kits
              </Button>
            </div>
          ) : step === "details" ? (
            <form onSubmit={submitDetails} noValidate>
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-2xl font-extrabold">
                  Where should we deliver?
                </DialogTitle>
                <DialogDescription>
                  We'll hand it to the warden or reception if you're not there yet.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-success/30 bg-success-soft p-3 text-sm text-success-ink">
                <UserRoundCheck className="mt-0.5 size-4 shrink-0" />
                <p>
                  <span className="font-bold">Guest checkout — no account needed.</span> Just tell
                  us where to deliver and who to call.
                </p>
              </div>

              <FormSection title="Receiver">
                <TextField
                  id="co-name"
                  label="Receiver's name"
                  error={errors["name"]}
                  value={d.name}
                  onChange={(v) => setField("name", v)}
                  autoComplete="name"
                  placeholder="Aarav Sharma"
                />
                <TextField
                  id="co-phone"
                  label="Mobile"
                  error={errors["phone"]}
                  value={d.phone}
                  onChange={(v) => setField("phone", v)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="98765 43210"
                />
              </FormSection>

              <FormSection title="Hostel / PG address">
                <div className="sm:col-span-2">
                  <TextField
                    id="co-hostel"
                    label="Hostel / PG name"
                    error={errors["hostel"]}
                    value={d.hostel}
                    onChange={(v) => setField("hostel", v)}
                    placeholder="Allen Boys Hostel"
                  />
                </div>
                <TextField
                  id="co-block"
                  label="Block / Wing (optional)"
                  value={d.block}
                  onChange={(v) => setField("block", v)}
                  placeholder="Block B"
                />
                <TextField
                  id="co-room"
                  label="Room number"
                  error={errors["room"]}
                  value={d.room}
                  onChange={(v) => setField("room", v)}
                  placeholder="204"
                />
                <div className="sm:col-span-2">
                  <TextField
                    id="co-landmark"
                    label="Landmark (optional)"
                    value={d.landmark}
                    onChange={(v) => setField("landmark", v)}
                    placeholder="Near City Mall, Landmark City"
                  />
                </div>
                <Field label="City" htmlFor="co-city">
                  <div className="relative">
                    <select
                      id="co-city"
                      className={selectClass}
                      value={city}
                      onChange={(e) => onCity(e.target.value as City)}
                    >
                      {CITIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <TextField
                  id="co-pin"
                  label="Pincode"
                  error={errors["pincode"]}
                  value={d.pincode}
                  onChange={(v) => setField("pincode", v.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="324005"
                  autoComplete="postal-code"
                />
              </FormSection>

              <FormSection
                title="Contact at the destination"
                hint="Someone who can receive the box if you haven't arrived — warden, reception or a parent."
              >
                <TextField
                  id="co-contact"
                  label="Contact person"
                  error={errors["contactName"]}
                  value={d.contactName}
                  onChange={(v) => setField("contactName", v)}
                  placeholder="Mr. Verma (Warden)"
                />
                <TextField
                  id="co-altphone"
                  label="Alternate phone"
                  error={errors["altPhone"]}
                  value={d.altPhone}
                  onChange={(v) => setField("altPhone", v)}
                  inputMode="tel"
                  placeholder="91234 56789"
                />
              </FormSection>
              <div className="mt-4">
                <MoveInPicker id="co-movein" city={city} moveIn={moveIn} onMoveIn={onMoveIn} />
                {errors["moveIn"] && (
                  <p className="mt-1.5 text-xs font-medium text-destructive">{errors["moveIn"]}</p>
                )}
              </div>
              <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
                <PriceSummary cart={cart} />
              </div>
              <Button type="submit" variant="hero" size="xl" className="mt-5 w-full">
                Continue to Payment
              </Button>
            </form>
          ) : step === "payment" ? (
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-2xl font-extrabold">
                  How would you like to pay?
                </DialogTitle>
                <DialogDescription>
                  Total {formatINR(t.total)} · delivering to {city}
                </DialogDescription>
              </DialogHeader>
              <div
                className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
                role="radiogroup"
                aria-label="Payment method"
              >
                {PAY_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={method === m.id}
                    onClick={() => {
                      setMethod(m.id);
                      setErrors({});
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-colors",
                      method === m.id
                        ? "border-primary bg-primary-soft text-accent-foreground"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <m.icon className="size-5" />
                    {m.label}
                  </button>
                ))}
              </div>

              <div
                key={method}
                className="mt-5 animate-fade-up rounded-2xl border border-border p-4"
              >
                {method === "upi" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                        <span
                          key={app}
                          className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                    <Field label="UPI ID" error={errors["upi"]} htmlFor="pay-upi">
                      <Input
                        id="pay-upi"
                        className={fieldClass}
                        value={upi}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="yourname@okaxis"
                        autoComplete="off"
                      />
                    </Field>
                    <p className="text-xs text-muted-foreground">
                      You'll get a collect request in your UPI app.
                    </p>
                  </div>
                )}
                {method === "card" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Card number" error={errors["number"]} htmlFor="pay-card">
                        <Input
                          id="pay-card"
                          className={fieldClass}
                          inputMode="numeric"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                          placeholder="4111 1111 1111 1111"
                          autoComplete="cc-number"
                        />
                      </Field>
                    </div>
                    <Field label="Expiry" error={errors["expiry"]} htmlFor="pay-exp">
                      <Input
                        id="pay-exp"
                        className={fieldClass}
                        inputMode="numeric"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        autoComplete="cc-exp"
                      />
                    </Field>
                    <Field label="CVV" error={errors["cvv"]} htmlFor="pay-cvv">
                      <Input
                        id="pay-cvv"
                        className={fieldClass}
                        type="password"
                        inputMode="numeric"
                        maxLength={3}
                        value={card.cvv}
                        onChange={(e) =>
                          setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })
                        }
                        placeholder="•••"
                        autoComplete="cc-csc"
                      />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Name on card" error={errors["cardName"]} htmlFor="pay-cname">
                        <Input
                          id="pay-cname"
                          className={fieldClass}
                          value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value })}
                          autoComplete="cc-name"
                        />
                      </Field>
                    </div>
                  </div>
                )}
                {method === "netbanking" && (
                  <div>
                    <p className="mb-2 text-xs font-semibold">Popular banks</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {BANKS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          aria-pressed={bank === b}
                          onClick={() => setBank(b)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-sm font-semibold",
                            bank === b ? "border-primary bg-primary-soft" : "border-border",
                          )}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    {errors["bank"] && (
                      <p className="mt-2 text-xs font-medium text-destructive">{errors["bank"]}</p>
                    )}
                  </div>
                )}
                {method === "cod" && (
                  <div className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
                      <Banknote className="size-5" />
                    </span>
                    <div className="text-sm">
                      <p className="font-bold">Pay {formatINR(t.total)} when the box arrives</p>
                      <p className="mt-1 text-muted-foreground">
                        Cash or UPI to the delivery partner. COD fee: ₹0. The warden can pay on your
                        behalf.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <Button
                  variant="line"
                  size="xl"
                  onClick={() => setStep("details")}
                  disabled={processing}
                >
                  <ChevronLeft /> Back
                </Button>
                <Button
                  variant={method === "cod" ? "trust" : "hero"}
                  size="xl"
                  className="flex-1"
                  onClick={pay}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Processing…
                    </>
                  ) : method === "cod" ? (
                    "Place COD Order"
                  ) : (
                    `Pay ${formatINR(t.total)}`
                  )}
                </Button>
              </div>
            </div>
          ) : (
            order && (
              <div className="text-center">
                <span className="mx-auto grid size-16 animate-pop place-items-center rounded-full bg-success-soft text-success">
                  <PartyPopper className="size-8" />
                </span>
                <DialogTitle className="mt-4 font-display text-3xl font-extrabold">
                  Order confirmed!
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Thanks {order.name.split(" ")[0]}. Your room is on its way — it'll be there{" "}
                  {order.arrival}, a day before you move in.
                </DialogDescription>
                <div className="mt-6 space-y-3 rounded-2xl border border-border bg-secondary/50 p-4 text-left text-sm">
                  <Row
                    label="Order ID"
                    value={<span className="font-mono font-bold">{order.id}</span>}
                  />
                  <Row label="Kits" value={order.kitNames.join(", ")} />
                  {order.addonNames.length > 0 && (
                    <Row label="Add-ons" value={order.addonNames.join(", ")} />
                  )}
                  <Row label="Deliver to" value={order.address} />
                  <Row label="Contact at room" value={order.contact} />
                  <Row label="Move-in" value={order.moveIn} />
                  <Row
                    label="Arrives"
                    value={<span className="font-bold text-success-ink">{order.arrival}</span>}
                  />
                  <Row
                    label={order.method === "cod" ? "Pay on delivery" : "Paid"}
                    value={
                      <span className="font-display text-lg font-extrabold">
                        {formatINR(order.total)}
                      </span>
                    }
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  <ShieldCheck className="mr-1 inline size-3.5 text-success" />
                  Covered by our 7-day no-questions-asked replacement.
                </p>
                <Button
                  variant="ink"
                  size="xl"
                  className="mt-5 w-full"
                  onClick={() => handleOpen(false)}
                >
                  Done
                </Button>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
