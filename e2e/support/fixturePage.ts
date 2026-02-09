import { expect, type Page } from "@playwright/test";

export async function openFixturePage(page: Page) {
  await page.goto("/");
  await expect(page.locator("#app")).toHaveCount(1);
  await page.waitForFunction(() => {
    return Boolean((window as Window & { plutonE2E?: unknown }).plutonE2E);
  });
}
