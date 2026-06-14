import { expect, test } from "@playwright/test";
import { testAdmin } from "./test-constants";

test("unauthenticated users are redirected to login", async ({ page }) => {
  await page.goto("/teams");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Iniciar sesión")).toBeVisible();
});

test("invalid credentials show an error", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Correo electrónico").fill("wrong@example.com");
  await page.getByLabel("Contraseña").fill("not-the-password");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(
    page.getByText("Credenciales incorrectas. Inténtalo de nuevo."),
  ).toBeVisible();
});

test("seeded admin can access teams and sign out", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Correo electrónico").fill(testAdmin.email);
  await page.getByLabel("Contraseña").fill(testAdmin.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/teams$/);
  await expect(page.getByText("Backstage", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/teams"]')).toBeVisible();
  await expect(page.getByText("Sin equipos registrados")).toBeVisible();
  await expect(
    page.getByText("Añade el primer equipo para comenzar."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/teams");
  await expect(page).toHaveURL(/\/login$/);
});

test("root redirects into the protected teams workflow", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Correo electrónico").fill(testAdmin.email);
  await page.getByLabel("Contraseña").fill(testAdmin.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/teams$/);
  await expect(page.getByText("Sin equipos registrados")).toBeVisible();
});
