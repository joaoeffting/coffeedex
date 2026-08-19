import { test, expect } from "@playwright/test";

// Targets Stockholm dex #1 (Drop Coffee) — a real, stable shop, not a
// per-run fixture (see tests/README.md). Cleans up its own review at the
// end so repeated runs don't pile up on that shop's real page.
test.describe("reviews", () => {
  test("leave, edit, and delete a review", async ({ page }) => {
    await page.goto("/shops/stockholm/1");
    await expect(page.getByRole("heading", { name: "Drop Coffee" })).toBeVisible();

    // Leave a review
    await page.getByRole("button", { name: "4 stars" }).click();
    await page
      .getByPlaceholder("Optional comment")
      .fill("Playwright test review — safe to ignore/delete.");
    await page.getByRole("button", { name: "Post review" }).click();

    // Scoped to the list item labeled "You" specifically — the review
    // form's own textarea is pre-filled with the same text once it
    // becomes an existing review (ambiguous with a plain page-wide text
    // match), and other test runs' shops/[dexNumber] can leave same-
    // worded stray reviews behind if a run fails before cleanup.
    const myReview = page.getByRole("listitem").filter({ hasText: "You" });
    await expect(myReview).toBeVisible();
    await expect(
      myReview.getByText("Playwright test review — safe to ignore/delete."),
    ).toBeVisible();

    // Edit it — resubmitting should update the same row, not add a second
    await page.getByRole("button", { name: "5 stars" }).click();
    await page
      .getByPlaceholder("Optional comment")
      .fill("Playwright test review — edited.");
    await page.getByRole("button", { name: "Update review" }).click();

    await expect(
      myReview.getByText("Playwright test review — edited."),
    ).toBeVisible();
    // Editing updates the same row rather than adding a second one —
    // exactly one "You" item, regardless of how many other real reviews
    // this shop has from other users.
    await expect(
      page.getByRole("listitem").filter({ hasText: "You" }),
    ).toHaveCount(1);

    // Delete it (cleanup)
    await myReview.getByRole("button", { name: "Delete" }).click();
    await expect(
      page.getByRole("listitem").filter({ hasText: "You" }),
    ).toHaveCount(0);
  });
});
