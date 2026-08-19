// Client-only — the remembered city lives in localStorage, not a cookie,
// so nothing here can run during SSR. Callers are expected to be client
// components (or effects) that only touch this after mount.
const STORAGE_KEY = "coffeedex:city";

export function getStoredCitySlug(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredCitySlug(citySlug: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, citySlug);
}
