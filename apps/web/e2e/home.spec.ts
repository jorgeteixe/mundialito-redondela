import { expect, test } from "@playwright/test";

test("homepage renders public event information", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Mundialito da Xunqueira" }),
  ).toBeVisible();
  await expect(page.getByText("Pista de A Xunqueira, Redondela")).toBeVisible();
  await expect(page.getByText("29 jun – 24 jul 2026")).toBeVisible();
  await expect(page.getByRole("link", { name: /Inscríbete/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Más información/ }),
  ).toBeVisible();
});
