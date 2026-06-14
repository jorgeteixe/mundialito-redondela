import { expect, test } from "@playwright/test";
import { testAdmin } from "./test-constants";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");

  await page.getByLabel("Correo electrónico").fill(testAdmin.email);
  await page.getByLabel("Contraseña").fill(testAdmin.password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

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
  await signIn(page);

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

test("admin can manage teams and nested players", async ({ page }) => {
  await signIn(page);

  await expect(page).toHaveURL(/\/teams$/);

  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Redondela Norte");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();

  await expect(page.getByText("Equipo registrado.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Redondela Norte/ }),
  ).toBeVisible();
  await expect(
    page.locator('img[alt="Avatar de Redondela Norte"]:visible'),
  ).toBeVisible();

  await page.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await page.getByLabel("Nombre del equipo").fill("Redondela Sur");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Cadete" }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Equipo actualizado.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Redondela Sur/ })).toBeVisible();
  await expect(page.locator("text=Cadete").last()).toBeVisible();

  await page.getByRole("link", { name: /Redondela Sur/ }).click();
  await expect(page).toHaveURL(/\/teams\/[0-9a-f-]+$/);
  await expect(page.getByText("Sin jugadores registrados")).toBeVisible();

  await page.getByRole("button", { name: "Añadir jugador" }).first().click();
  await page.getByLabel("Nombre del jugador").fill("Paula Lago");
  await page.getByRole("button", { name: "Añadir jugador" }).click();

  await expect(page.getByText("Jugador añadido.")).toBeVisible();
  await expect(page.getByText("Paula Lago")).toBeVisible();
  await expect(
    page.locator('img[alt="Avatar de Paula Lago"]:visible'),
  ).toBeVisible();

  await page.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await page.getByLabel("Nombre del jugador").fill("Paula Lago Rei");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Jugador actualizado.")).toBeVisible();
  await expect(page.getByText("Paula Lago Rei")).toBeVisible();

  await page.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar jugador" }).click();

  await expect(page.getByText("Sin jugadores registrados")).toBeVisible();

  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar equipo" }).click();

  await expect(page).toHaveURL(/\/teams$/);
  await expect(page.getByText("Sin equipos registrados")).toBeVisible();
});
