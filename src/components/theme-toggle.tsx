"use client";

import { useSyncExternalStore } from "react";
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  type ThemePreference,
} from "@/lib/theme-preference";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

// No real subscription needed — same pattern as ChangeCityPicker for
// reading a localStorage value without a server/client mismatch on
// first paint.
function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const current = useSyncExternalStore(subscribe, getStoredTheme, () => "system");

  function choose(theme: ThemePreference) {
    setStoredTheme(theme);
    applyTheme(theme);
  }

  return (
    <div className="dex-outline flex overflow-hidden rounded-full">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          aria-pressed={current === value}
          className={
            current === value
              ? "flex-1 bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
              : "flex-1 bg-card px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-muted active:bg-muted"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
