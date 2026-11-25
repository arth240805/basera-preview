// Decorative motion for the Basera pages: everything here is aria-hidden or purely visual,
// uses design tokens only, and is switched off for visitors who ask for reduced motion.
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Building2, Package, PackageCheck, Truck } from "lucide-react";

import { ITEM_PHOTOS } from "@/components/dropnest/itemPhotos";
import { ITEMS_BY_ID } from "@/lib/dropnest";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Counts up to a number the first time it scrolls into view. Renders the final value on the server. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setValue(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const shown = value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

/** A kit item photo that gently bobs beside the hero photo, drifting with scroll at its own speed. */
export function FloatingItem({
  id,
  label,
  className,
  delay = 0,
  tilt = 0,
  speed = 0.12,
}: {
  id: string;
  label: string;
  className?: string;
  delay?: number;
  tilt?: number;
  speed?: number;
}) {
  return (
    <Parallax speed={speed} aria-hidden className={cn("pointer-events-none absolute z-10", className)}>
      <div
        className="flex animate-float items-center gap-2 rounded-2xl border border-border bg-card/95 p-1.5 pr-3 shadow-lift backdrop-blur"
        style={{ animationDelay: `${delay}ms`, ["--tilt" as string]: `${tilt}deg` }}
      >
        <img
          src={ITEM_PHOTOS[id]}
          alt=""
          width={320}
          height={320}
          className="size-10 rounded-xl object-cover"
        />
        <span className="text-xs font-bold">{label}</span>
        <span className="grid size-4 place-items-center rounded-full bg-success text-[9px] text-success-foreground">
          ✓
        </span>
      </div>
    </Parallax>
  );
}

const MARQUEE_IDS = [
  "pillow",
  "bucket-mug",
  "kettle",
  "led-lamp",
  "quilt",
  "study-chair",
  "hangers",
  "iron",
  "extension-board",
  "lock-box",
  "first-aid",
  "wall-clock",
  "mosquito-net",
  "lap-table",
];

/** An endless, slow ribbon of the things that come in the box. Pauses on hover. */
export function ItemMarquee() {
  const items = MARQUEE_IDS.filter((id) => ITEM_PHOTOS[id] && ITEMS_BY_ID[id]);
  const row = (copy: number) =>
    items.map((id) => (
      <li
        key={`${copy}-${id}`}
        className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 shadow-soft"
      >
        <img
          src={ITEM_PHOTOS[id]}
          alt=""
          loading="lazy"
          width={320}
          height={320}
          className="size-8 rounded-full object-cover"
        />
        <span className="whitespace-nowrap text-sm font-semibold">
          {ITEMS_BY_ID[id]?.name.split(" (")[0]}
        </span>
      </li>
    ));
  return (
    <div aria-hidden className="group mask-fade-x overflow-hidden py-5">
      <ul className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
        {row(0)}
        {row(1)}
      </ul>
    </div>
  );
}

/** A dashed road with a delivery truck driving from the warehouse to the hostel. */
export function DeliveryRoute() {
  return (
    <div aria-hidden className="relative mx-auto mt-10 hidden h-16 max-w-6xl items-center lg:flex">
      <span className="z-10 grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-cta">
        <Package className="size-5" />
      </span>
      <div className="relative mx-3 h-full flex-1 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-border" />
        {[12.5, 37.5, 62.5, 87.5].map((left, i) => (
          <span
            key={left}
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-highlight shadow-sm"
            style={{ left: `${left}%` }}
          >
            <span
              className="absolute inset-0 animate-ping rounded-full bg-highlight/60"
              style={{ animationDelay: `${i * 450}ms`, animationDuration: "2.4s" }}
            />
          </span>
        ))}
        <div className="absolute inset-0 animate-drive">
          <span className="absolute left-0 top-1/2 flex -translate-x-full -translate-y-1/2 items-center">
            <span className="mr-1 flex flex-col gap-1 opacity-60">
              <span className="h-0.5 w-5 rounded-full bg-muted-foreground/50" />
              <span className="ml-2 h-0.5 w-3 rounded-full bg-muted-foreground/50" />
            </span>
            <span className="grid size-10 animate-bob place-items-center rounded-xl bg-highlight text-highlight-foreground shadow-lift">
              <Truck className="size-5" />
            </span>
          </span>
        </div>
      </div>
      <span className="z-10 grid size-11 shrink-0 place-items-center rounded-2xl border border-border bg-card text-primary shadow-soft">
        <Building2 className="size-5" />
      </span>
    </div>
  );
}

/** Soft, slowly drifting boxes for dark sections. */
export function DriftingBoxes() {
  const boxes = [
    { left: "6%", top: "18%", size: 34, delay: 0, Icon: Package },
    { left: "44%", top: "8%", size: 22, delay: 2500, Icon: PackageCheck },
    { left: "88%", top: "22%", size: 40, delay: 1200, Icon: Package },
    { left: "14%", top: "78%", size: 26, delay: 3800, Icon: PackageCheck },
    { left: "52%", top: "86%", size: 30, delay: 600, Icon: Package },
    { left: "80%", top: "70%", size: 24, delay: 5000, Icon: PackageCheck },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {boxes.map(({ left, top, size, delay, Icon }, i) => (
        <Icon
          key={i}
          className="absolute animate-drift text-ink-muted/15"
          style={{ left, top, width: size, height: size, animationDelay: `${delay}ms` }}
          strokeWidth={1.4}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── Interaction hooks ───────────────────────── */

function finePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

/**
 * Hides an element (or its children, with `.stagger`) until it scrolls into view, then plays
 * the rise-in animation. Elements already on screen, SSR output and reduced-motion visitors
 * are never hidden.
 */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.dataset["motion"] = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset["motion"] = "in";
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (el.dataset["motion"] === "pending") delete el.dataset["motion"];
    };
  }, []);
  return ref;
}

type RevealTag = "div" | "ul" | "ol" | "section";
type RevealProps = { as?: RevealTag; children: ReactNode } & HTMLAttributes<HTMLElement>;

/** Rises into view as one block when scrolled to. */
export function Reveal({ as = "div", className, children, ...rest }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={cn("reveal-up", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Children rise into view one after another when the group is scrolled to. */
export function Stagger({ as = "div", className, children, ...rest }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={cn("stagger", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Pulls its child toward the cursor while hovered (mouse only). */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !finePointer()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${x.toFixed(1)}px`);
        el.style.setProperty("--my", `${y.toFixed(1)}px`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={cn("magnetic", className)}>
      {children}
    </span>
  );
}

/** Pointer handlers for `.tilt` / `.tilt-glare` cards: a gentle 3D lean toward the cursor. */
export function tiltMove(e: ReactPointerEvent<HTMLElement>, max = 6) {
  if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
  el.style.setProperty("--rx", `${((0.5 - py) * max * 2).toFixed(2)}deg`);
  el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
  el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
}

export function tiltLeave(e: ReactPointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

/** Moves its content against the scroll; positive speed drifts up as you scroll down. */
export function Parallax({
  speed = 0.1,
  className,
  children,
  ...rest
}: { speed?: number; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    let current = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      // Measure the untransformed position so the offset never feeds back into itself.
      const centre = r.top - current + r.height / 2 - window.innerHeight / 2;
      current = -centre * speed;
      el.style.setProperty("--parallax", `${current.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);
  return (
    <div ref={ref} className={cn("parallax", className)} {...rest}>
      {children}
    </div>
  );
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/** A thin animated-gradient bar along the top that fills as you scroll the page. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]">
      <div ref={ref} className="scroll-progress bg-gradient-flow h-full w-full" />
    </div>
  );
}

/** A flippable informational tile, usable by pointer, keyboard, or touch. */
export function FlipCard({ front, back, label }: { front: ReactNode; back: ReactNode; label: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <Button
      variant="ghost"
      aria-label={label}
      aria-pressed={flipped}
      onClick={() => setFlipped((value) => !value)}
      className="flip-card block h-full min-h-60 w-full whitespace-normal rounded-3xl p-0 text-left hover:bg-transparent"
    >
      <span className="flip-inner">
        <span aria-hidden className="flip-face block rounded-3xl border border-border bg-card p-6 shadow-soft">{front}</span>
        <span aria-hidden className="flip-face flip-back flex flex-col justify-center rounded-3xl border border-primary bg-primary p-6 text-primary-foreground shadow-lift">{back}</span>
      </span>
    </Button>
  );
}
