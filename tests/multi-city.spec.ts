import { test, expect } from "@playwright/test";

test.describe("multi-city switching", () => {
  test("switching city via /change-city persists across navigation", async ({
    page,
  }) => {
    await page.goto("/change-city");
    await page.getByRole("button", { name: "Gdansk" }).click();

    await expect(page).toHaveURL(/\/dex\/gdansk$/);
    await expect(page.getByText("Przelewki by Fat Duck")).toBeVisible();

    // Bare /dex has no city in the URL — must read the remembered
    // preference (localStorage) rather than always defaulting to Stockholm.
    await page.goto("/dex");
    await expect(page).toHaveURL(/\/dex\/gdansk$/);

    // Dex <-> Map toggle should carry the current city along, not reset it
    await page.getByRole("link", { name: "Map" }).click();
    await expect(page).toHaveURL(/\/discover\/gdansk$/);

    // No cleanup needed here — Playwright gives every test a fresh
    // browser context seeded from tests/.auth/user.json, so this test's
    // localStorage changes don't carry over to any other test.
  });
});
