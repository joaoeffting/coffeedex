"use client";

import { useState } from "react";
import { Star } from "lucide-react";

// A hover-preview star picker needs live interaction state (which star the
// pointer is over vs. which one is actually selected) — not something a
// plain radio-group can do without a fragile CSS sibling-selector hack, so
// this is a small client component rather than pure server-rendered markup.
export function StarRatingInput({
  name,
  defaultValue = 0,
}: {
  name: string;
  defaultValue?: number;
}) {
  const [selected, setSelected] = useState(defaultValue);
  const [hovered, setHovered] = useState(0);
  const display = hovered || selected;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setSelected(n)}
          onMouseEnter={() => setHovered(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="dex-outline dex-press rounded"
        >
          <Star
            className={
              n <= display
                ? "h-7 w-7 fill-primary text-primary"
                : "h-7 w-7 text-muted-foreground"
            }
          />
        </button>
      ))}
      <input type="hidden" name={name} value={selected} />
    </div>
  );
}
