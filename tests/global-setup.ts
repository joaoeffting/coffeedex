import { chromium, type FullConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

// Unlike Storyloom (hosted Supabase, "Confirm email" on, needs a real
// pre-confirmed account), coffeedex-dev has email confirmation off — see
// login/actions.ts's comment on signUp(). So this signs up a fresh
// throwaway account every run through the real signup form instead of
// requiring a one-time manual setup step. Trade-off: coffeedex-dev
// accumulates a new auth.users row per run — fine for a dev project
// nobody else reads, never do this against prod (this suite only ever
// targets localhost:3100, which always runs against .env.local).
export default async function globalSetup(config: FullConfig) {
  const email = `playwright-${Date.now()}@coffeedex.test`;
  const password = "playwright-test-password";

  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto("/login?tab=signup");
  await page.fill("#signup-email", email);
  await page.fill("#signup-password", password);
  await page.locator("form:has(#signup-password) button[type=submit]").click();
  await page.waitForURL(/\/account$/);

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });

  await browser.close();
}
