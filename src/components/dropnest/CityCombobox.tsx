import { useId, useState } from "react";
import { MapPin } from "lucide-react";

import { useDropnest } from "@/components/dropnest/store";
import { suggestCities } from "@/lib/cities";
import { cn } from "@/lib/utils";

/** Type-ahead city field. Defaults to the shared delivery city in the store. */
export function CityCombobox({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value?: string;
  onChange?: (name: string) => void;
  className?: string;
}) {
  const store = useDropnest();
  const current = value ?? store.cityName;
  const commit = onChange ?? store.setCity;
  const [text, setText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const shown = text ?? current;
  const list = open ? suggestCities(text ?? "") : [];

  const pick = (name: string) => {
    commit(name);
    setText(null);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        role="combobox"
        aria-expanded={list.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Type your city, e.g. Indore"
        value={shown}
        onFocus={(e) => {
          setOpen(true);
          setText("");
          setActive(0);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => {
          const t = (text ?? "").trim();
          if (t) pick(suggestCities(t, 1)[0] ?? t);
          else {
            setText(null);
            setOpen(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, list.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const t = (text ?? "").trim();
            const choice = list[active] ?? t;
            if (choice) pick(choice);
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            setText(null);
            setOpen(false);
          }
        }}
        className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm font-semibold outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
      {list.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lift"
        >
          {list.map((c, i) => (
            <li
              key={c}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(c);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2 text-sm",
                i === active ? "bg-primary-soft text-foreground" : "",
                c === current && "font-bold",
              )}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
