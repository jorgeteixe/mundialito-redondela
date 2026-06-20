import { expect, test } from "@playwright/test";
import { testAdmin } from "./test-constants";

test.describe.configure({ mode: "serial" });

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
  await expect(page.locator('a[href="/groups"]')).toBeVisible();
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

test("admin can manage groups and team membership", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Grupo Norte");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();
  await expect(page.getByText("Equipo registrado.")).toBeVisible();

  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Grupo Sur");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Cadete" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();
  await expect(page.getByText("Equipo registrado.")).toBeVisible();

  await page.getByRole("link", { name: "Grupos" }).click();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.getByText("Sin grupos registrados")).toBeVisible();

  await page.getByRole("button", { name: "Registrar grupo" }).first().click();
  await page.getByLabel("Nombre del grupo").fill("Grupo A");
  await page.getByLabel("Letra o número").fill("A");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar grupo" }).click();

  await expect(page.getByText("Grupo registrado.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Grupo A/ })).toBeVisible();
  await expect(
    page.locator('[data-slot="avatar-fallback"]:visible').filter({
      hasText: "A",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await page.getByLabel("Nombre del grupo").fill("Grupo B");
  await page.getByLabel("Letra o número").fill("B");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Grupo actualizado.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Grupo B/ })).toBeVisible();
  await expect(
    page.locator('[data-slot="avatar-fallback"]:visible').filter({
      hasText: "B",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: /Grupo B/ }).click();
  await expect(page).toHaveURL(/\/groups\/[0-9a-f-]+$/);
  await expect(page.getByText("Sin equipos registrados")).toBeVisible();

  await page.getByRole("button", { name: "Añadir equipo" }).first().click();
  await page.getByRole("combobox", { name: "Equipo" }).click();
  await page.getByRole("option", { name: /Grupo Norte/ }).click();
  await page.getByRole("button", { name: "Añadir equipo" }).click();

  await expect(page.getByText("Equipo añadido.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Grupo Norte" })).toBeVisible();

  await page.getByRole("button", { name: "Añadir equipo" }).first().click();
  await expect(
    page.getByText("No hay equipos senior sin grupo disponibles."),
  ).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Equipo" })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Añadir equipo" }).last(),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("option", { name: /Grupo Norte/ })).toHaveCount(
    0,
  );
  await expect(page.getByRole("option", { name: /Grupo Sur/ })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Quitar equipo" }).click();
  await page.getByRole("button", { name: "Quitar equipo" }).click();

  await expect(page.getByText("Sin equipos registrados")).toBeVisible();

  await page.getByRole("button", { name: "Añadir equipo" }).first().click();
  await page.getByRole("combobox", { name: "Equipo" }).click();
  await expect(page.getByRole("option", { name: /Grupo Norte/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Grupo Sur/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Cadete" }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Grupo actualizado.")).toBeVisible();

  await page.getByRole("button", { name: "Añadir equipo" }).first().click();
  await page.getByRole("combobox", { name: "Equipo" }).click();
  await expect(page.getByRole("option", { name: /Grupo Norte/ })).toHaveCount(
    0,
  );
  await expect(page.getByRole("option", { name: /Grupo Sur/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar grupo" }).click();

  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.getByText("Sin grupos registrados")).toBeVisible();

  await page.goto("/teams");

  for (const teamName of ["Grupo Norte", "Grupo Sur"]) {
    const row = page.locator("tr").filter({ hasText: teamName });
    await row.getByRole("button", { name: "Acciones" }).click();
    await page.getByRole("menuitem", { name: "Eliminar" }).click();
    await page.getByRole("button", { name: "Eliminar equipo" }).click();
    await expect(page.getByRole("link", { name: teamName })).toHaveCount(0);
  }

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
