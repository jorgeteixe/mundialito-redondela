import { screenshot } from "@storycap-testrun/browser";
import { page } from "vitest/browser";
import { afterEach, beforeEach } from "vitest";

beforeEach(async () => {
  await page.viewport(900, 600);
});

afterEach(async (context) => {
  if (import.meta.env.VITE_STORYCAP_SCREENSHOTS === "true") {
    await screenshot(page, context, {
      fullPage: false,
      scale: "css",
    });
  }
});
