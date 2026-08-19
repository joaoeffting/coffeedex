import { test, expect } from "@playwright/test";

// A fresh account (see global-setup.ts) always starts at 0 visited, so
// these counts are safe to assert on exact values, not just deltas.
test.describe("visited tracking", () => {
  test("hold-to-confirm mark/unmark, progress counter, filter tabs", async ({
    page,
  }) => {
    await page.goto("/dex/stockholm");

    // Scoped to the progress card's own paragraph, not a bare digit —
    // Next's dev-mode issues overlay also renders a lone "0"/"1" some-
    // where on the page, which a plain getByText("1") collides with.
    const progress = page.locator("p.font-heading.text-xl.font-semibold");
    await expect(progress).toHaveText(/0\s*of 20 visited/);

    const card = page.locator("div", { hasText: "Drop Coffee" }).last();
    const holdButton = card.getByRole("button", {
      name: "Hold to mark visited",
    });

    // The button only fires on its CSS transition completing (~1.1s) —
    // dispatchEvent gives a real PointerEvent without relying on mouse
    // simulation timing, then we just wait out the hold duration.
    await holdButton.dispatchEvent("pointerdown");
    await page.waitForTimeout(1400);

    await expect(
      page.getByText("Visited", { exact: true }).first(),
    ).toBeVisible();
    await expect(progress).toHaveText(/1\s*of 20 visited/);

    // Filter tabs
    await page.getByRole("button", { name: /^Visited \(\d+\)/ }).click();
    await expect(page.getByText("Drop Coffee")).toBeVisible();
    await page.getByRole("button", { name: /^Not yet \(\d+\)/ }).click();
    await expect(page.getByText("Drop Coffee")).toHaveCount(0);
    await page.getByRole("button", { name: /^All \(\d+\)/ }).click();

    // Unmark (cleanup) — plain click, no hold needed
    await page.getByRole("button", { name: "Unmark visited" }).click();
    await expect(progress).toHaveText(/0\s*of 20 visited/);
  });
});
