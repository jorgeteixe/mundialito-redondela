import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
} from "vitest";
import { chromium, type Browser, type Page } from "playwright";

const BASE = "http://localhost:3002";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  const context = await browser.newContext();
  page = await context.newPage();
});

afterEach(async () => {
  await page.context().close();
});

test("unauthenticated GET / redirects to /login", async () => {
  await page.goto(`${BASE}/`);
  expect(page.url()).toContain("/login");
});

test("login with wrong credentials shows error", async () => {
  await page.goto(`${BASE}/login`);
  await page.locator("#email").fill("wrong@test.com");
  await page.locator("#password").fill("wrongpassword");
  await page.locator('button[type="submit"]').click();
  await page
    .getByText("Credenciales incorrectas")
    .waitFor({ state: "visible" });
});

test("login with correct credentials redirects to /", async () => {
  await page.goto(`${BASE}/login`);
  await page.locator("#email").fill("admin@test.com");
  await page.locator("#password").fill("testpassword123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`);
  expect(page.url()).not.toContain("/login");
});

test("authenticated GET /login redirects to /", async () => {
  await page.goto(`${BASE}/login`);
  await page.locator("#email").fill("admin@test.com");
  await page.locator("#password").fill("testpassword123");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login`);
  await page.waitForURL(`${BASE}/`);
  expect(page.url()).not.toContain("/login");
});
