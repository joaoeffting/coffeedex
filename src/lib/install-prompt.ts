// iOS Safari never fires `beforeinstallprompt` and has no native install
// banner (unlike Chrome/Android, which prompt on their own) — this is the
// only way an iOS visitor learns the app can go on their home screen.
const STORAGE_KEY = "coffeedex:install-prompt-dismissed";
const CHANGE_EVENT = "coffeedex:install-prompt-dismissed-change";

export function getIsIosInstallable(): boolean {
  if (typeof window === "undefined") return false;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  return isIOS && !isStandalone;
}

export function getInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function dismissInstallPrompt() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // localStorage can throw (private browsing, quota) — worst case the
    // prompt just reappears next visit, not worth crashing over.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Native "storage" only fires in other tabs, never the one that made the
// change — hence also dispatching + listening for the custom event above
// (same pattern as analytics-consent.ts).
export function subscribeToInstallPromptDismissed(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
