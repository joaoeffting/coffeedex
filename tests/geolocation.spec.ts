import { test, expect } from "@playwright/test";

// Only the button's own toggle state is asserted here, not the marker it
// puts on the map — Leaflet's internal DOM is fragile to assert on
// directly (see tests/README.md), but the interactive logic driving it
// (grant permission -> toggle on -> toggle off) is plain React state and
// safe to test directly.
test.describe("locate me", () => {
  test.use({
    geolocation: { latitude: 59.3168777, longitude: 18.0627109 }, // Drop Coffee, Stockholm #1
    permissions: ["geolocation"],
  });

  test("toggles on and off", async ({ page }) => {
    await page.goto("/discover/stockholm");

    const locateButton = page.getByRole("button", { name: "Show my location" });
    await expect(locateButton).toBeVisible();

    await locateButton.click();
    await expect(
      page.getByRole("button", { name: "Stop showing my location" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page
      .getByRole("button", { name: "Stop showing my location" })
      .click();
    await expect(
      page.getByRole("button", { name: "Show my location" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
