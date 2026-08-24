// Same pattern as city-preference.ts — client-only, localStorage-backed.
// No stored key at all means "system": follow prefers-color-scheme
// automatically rather than defaulting to light, so most people never
// need to touch this.
export const THEME_STORAGE_KEY = "coffeedex:theme";

export type ThemePreference = "system" | "light" | "dark";

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function setStoredTheme(theme: ThemePreference): void {
  if (typeof window === "undefined") return;
  if (theme === "system") {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// The single source of truth for turning a preference into the actual
// .dark class on <html> — called from the blocking inline script (first
// paint), from ThemeToggle (an explicit change), and from Providers (a
// live OS-theme change while "system" is selected).
export function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}
