// Decorative motion for the Dropnest pages: everything here is aria-hidden or purely visual,
// uses design tokens only, and is switched off for visitors who ask for reduced motion.
import { useEffect, useRef, useState } from "react";
import { Building2, Package, PackageCheck, Truck } from "lucide-react";

import { ITEM_PHOTOS } from "@/components/dropnest/itemPhotos";
import { ITEMS_BY_ID } from "@/lib/dropnest";
import { cn } from "@/lib/utils";

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

/** A kit item photo that gently bobs beside the hero photo. */
export function FloatingItem({
  id,
  label,
  className,
  delay = 0,
  tilt = 0,
}: {
  id: string;
  label: string;
  className?: string;
  delay?: number;
  tilt?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-10 flex animate-float items-center gap-2 rounded-2xl border border-border bg-card/95 p-1.5 pr-3 shadow-lift backdrop-blur",
        className,
      )}
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
