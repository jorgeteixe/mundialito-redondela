import { expect, test } from "@playwright/test";
import { testAdmin, testContentAdmin, testViewer } from "./test-constants";

test.describe.configure({ mode: "serial" });

async function signIn(page: import("@playwright/test").Page, user = testAdmin) {
  await page.goto("/login");

  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
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
  await expect(page.locator('a[href="/users"]')).toBeVisible();
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

test("super admin can create users, change roles, and reset passwords", async ({
  page,
}) => {
  await signIn(page);

  await page.getByRole("link", { name: "Usuarios" }).click();
  await expect(page).toHaveURL(/\/users$/);

  await page.getByRole("button", { name: "Crear usuario" }).first().click();
  await page.getByLabel("Nombre").fill(testContentAdmin.name);
  await page.getByLabel("Correo electrónico").fill(testContentAdmin.email);
  await page.getByLabel("Contraseña").fill(testContentAdmin.password);
  await page.getByRole("combobox", { name: "Rol" }).click();
  await page.getByRole("option", { name: "Admin", exact: true }).click();
  await page.getByRole("button", { name: "Crear usuario" }).click();
  await expect(page.getByText("Usuario creado.")).toBeVisible();
  await expect(page.getByText(testContentAdmin.email)).toBeVisible();

  await page.getByRole("button", { name: "Crear usuario" }).first().click();
  await page.getByLabel("Nombre").fill(testViewer.name);
  await page.getByLabel("Correo electrónico").fill(testViewer.email);
  await page.getByLabel("Contraseña").fill(testViewer.password);
  await page.getByRole("combobox", { name: "Rol" }).click();
  await page.getByRole("option", { name: "Solo lectura" }).click();
  await page.getByRole("button", { name: "Crear usuario" }).click();
  await expect(page.getByText("Usuario creado.")).toBeVisible();
  await expect(page.getByText(testViewer.email)).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Nombre" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Correo" }),
  ).toBeVisible();

  const updatedAdminName = "Admin Contenido Renombrado";
  const updatedAdminEmail =
    "content-admin-renamed.e2e@mundialitoredondela.test";
  const adminRow = page
    .locator("tr")
    .filter({ hasText: testContentAdmin.email });
  await adminRow.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await page.getByLabel("Nombre").fill(updatedAdminName);
  await page.getByLabel("Correo electrónico").fill(updatedAdminEmail);
  await page.getByRole("combobox", { name: "Rol" }).click();
  await page.getByRole("option", { name: "Admin", exact: true }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Usuario actualizado.")).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Editar usuario" }),
  ).toHaveCount(0);
  await expect(page.getByText(updatedAdminName)).toBeVisible();
  await expect(
    page.locator("tr").filter({ hasText: updatedAdminEmail }),
  ).toBeVisible();

  const updatedAdminRow = page
    .locator("tr")
    .filter({ hasText: updatedAdminEmail });
  await updatedAdminRow.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Cambiar contraseña" }).click();
  await page
    .getByLabel("Nueva contraseña")
    .fill(testContentAdmin.resetPassword);
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();
  await expect(page.getByText("Contraseña actualizada.")).toBeVisible();
  await page.keyboard.press("Escape");

  const viewerRow = page.locator("tr").filter({ hasText: testViewer.email });
  await viewerRow.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await page.getByRole("combobox", { name: "Rol" }).click();
  await page.getByRole("option", { name: "Solo lectura" }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Usuario actualizado.")).toBeVisible();
});

test("admin can mutate content but cannot manage users", async ({ page }) => {
  await signIn(page, {
    email: "content-admin-renamed.e2e@mundialitoredondela.test",
    name: "Admin Contenido Renombrado",
    password: testContentAdmin.resetPassword,
  });

  await expect(page).toHaveURL(/\/teams$/);
  await expect(page.locator('a[href="/users"]')).toHaveCount(0);
  await page.goto("/users");
  await expect(page.getByText("404")).toBeVisible();

  await page.goto("/teams");
  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Equipo Admin");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();
  await expect(page.getByText("Equipo registrado.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Equipo Admin/ })).toBeVisible();

  const row = page.locator("tr").filter({ hasText: "Equipo Admin" });
  await row.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar equipo" }).click();
  await expect(page.getByRole("link", { name: /Equipo Admin/ })).toHaveCount(0);
});

test("viewer can read backstage but cannot see mutation controls", async ({
  page,
}) => {
  await signIn(page, testViewer);

  await expect(page).toHaveURL(/\/teams$/);
  await expect(page.locator('a[href="/users"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Registrar equipo" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Acciones" })).toHaveCount(0);

  await page.getByRole("link", { name: "Grupos" }).click();
  await expect(
    page.getByRole("button", { name: "Registrar grupo" }),
  ).toHaveCount(0);
});

test("admin can manage groups and team membership", async ({ page }) => {
  await signIn(page);
  const expectToast = async (message: string) => {
    await expect(page.getByText(message).last()).toBeVisible();
  };

  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Grupo Norte");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();
  await expectToast("Equipo registrado.");
  await expect(page.getByRole("link", { name: /Grupo Norte/ })).toBeVisible();

  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Grupo Este");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();
  await expectToast("Equipo registrado.");
  await expect(page.getByRole("link", { name: /Grupo Este/ })).toBeVisible();

  await page.getByRole("button", { name: "Registrar equipo" }).first().click();
  await page.getByLabel("Nombre del equipo").fill("Grupo Sur");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Cadete" }).click();
  await page.getByRole("button", { name: "Registrar equipo" }).click();
  await expectToast("Equipo registrado.");
  await expect(page.getByRole("link", { name: /Grupo Sur/ })).toBeVisible();

  await page.getByRole("link", { name: "Grupos" }).click();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.getByText("Sin grupos registrados")).toBeVisible();

  await page.getByRole("button", { name: "Registrar grupo" }).first().click();
  await page.getByLabel("Nombre del grupo").fill("Grupo A");
  await page.getByLabel("Letra o número").fill("A");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Senior" }).click();
  await page.getByRole("button", { name: "Registrar grupo" }).click();

  await expectToast("Grupo registrado.");
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

  await expectToast("Grupo actualizado.");
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

  await expectToast("Equipo añadido.");
  await expect(page.getByRole("link", { name: "Grupo Norte" })).toBeVisible();

  await page.getByRole("button", { name: "Añadir equipo" }).first().click();
  await page.getByRole("combobox", { name: "Equipo" }).click();
  await expect(page.getByRole("option", { name: /Grupo Norte/ })).toHaveCount(
    0,
  );
  await page.getByRole("option", { name: /Grupo Este/ }).click();
  await page.getByRole("button", { name: "Añadir equipo" }).click();
  await expectToast("Equipo añadido.");
  await expect(page.getByRole("link", { name: "Grupo Este" })).toBeVisible();

  await page.getByRole("tab", { name: "Calendario" }).click();
  await expect(page.getByText("Sin partidos programados")).toBeVisible();
  await page.getByRole("button", { name: "Programar partido" }).first().click();
  await expect(
    page.getByRole("dialog", { name: "Programar partido" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Programar" })).toBeDisabled();
  await page.getByRole("combobox", { name: "Equipo local" }).click();
  await page.getByRole("option", { name: "Grupo Norte" }).click();
  await page.getByRole("combobox", { name: "Equipo visitante" }).click();
  await expect(
    page.getByRole("option", { name: "Grupo Norte" }),
  ).toBeDisabled();
  await page.getByRole("option", { name: "Grupo Este" }).click();
  await expect(page.getByRole("button", { name: "Programar" })).toBeDisabled();
  await page.getByRole("button", { name: "Fecha y hora (Madrid)" }).click();
  await page
    .locator('[data-slot="calendar"] button')
    .filter({ hasText: /^15$/ })
    .first()
    .click();
  await page.getByRole("textbox", { name: "Hora" }).fill("18:30");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Programar" }).click();
  await expectToast("Partido programado.");
  const matchRow = page.locator("tr").filter({ hasText: "Grupo Norte" });
  await expect(matchRow).toContainText("Grupo Este");
  await matchRow.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await expect(
    page.getByRole("dialog", { name: "Editar partido" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expectToast("Partido actualizado.");
  await expect(
    page.getByRole("dialog", { name: "Editar partido" }),
  ).toHaveCount(0);
  await matchRow.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: "Eliminar partido" }).click();
  await expect(page.getByText("Sin partidos programados")).toBeVisible();

  await page.getByRole("tab", { name: "Equipos" }).click();
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

  for (const teamName of ["Grupo Norte", "Grupo Este"]) {
    const teamCard = page.locator('[data-slot="card"]').filter({
      hasText: teamName,
    });
    await teamCard.getByRole("button", { name: "Quitar equipo" }).click();
    await page.getByRole("button", { name: "Quitar equipo" }).click();
  }

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
  await expectToast("Grupo actualizado.");

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

  for (const teamName of ["Grupo Norte", "Grupo Este", "Grupo Sur"]) {
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
