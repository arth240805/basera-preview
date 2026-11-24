// Basera brand mark: a roof sitting over a "B" — a home (basera) in one shape.
import { useId } from "react";

import { cn } from "@/lib/utils";

export function BaseraMark({ className }: { className?: string }) {
  const id = useId();
  const grad = `${id}-bg`;
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)" }} />
          <stop offset="1" style={{ stopColor: "var(--primary-deep)" }} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${grad})`} />
      <path
        d="M8.5 19.5 20 9.5l11.5 10"
        fill="none"
        className="stroke-highlight"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 17.6v12.4h6.4a3.2 3.2 0 0 0 0-6.4h-6.4m0 0h5.3a3 3 0 0 0 0-6h-5.3"
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
