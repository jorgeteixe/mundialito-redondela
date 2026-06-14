import { test, expect } from "@playwright/test";

test("unauthenticated GET / redirects to /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});

test("login with wrong credentials shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "wrong@test.com");
  await page.fill('input[type="password"]', "wrongpassword");
  await page.click('button[type="submit"]');
  await expect(
    page.getByText("Credenciales incorrectas", { exact: false }),
  ).toBeVisible();
});

test("login with correct credentials redirects to /", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "admin@test.com");
  await page.fill('input[type="password"]', "testpassword123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");
});

test("authenticated GET /login redirects to /", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "admin@test.com");
  await page.fill('input[type="password"]', "testpassword123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");
  await page.goto("/login");
  await expect(page).toHaveURL("/");
});
