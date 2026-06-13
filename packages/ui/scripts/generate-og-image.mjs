import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { chromium } from "playwright";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storybookStaticDir = path.resolve(__dirname, "../storybook-static");
const publicDir = path.resolve(__dirname, "../../../apps/web/public");
const layoutPath = path.resolve(__dirname, "../../../apps/web/app/layout.tsx");

// 1. Build Storybook
console.log("Building Storybook static files...");
execSync("pnpm build-storybook", {
  stdio: "inherit",
  cwd: path.resolve(__dirname, ".."),
});

// 2. Start a simple static file server on a random free port
console.log("Starting temporary web server...");
const server = http.createServer((req, res) => {
  const safePath = req.url.split("?")[0].replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(
    storybookStaticDir,
    safePath === "/" ? "index.html" : safePath,
  );

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

// Port selection
const port = 9999;
server.listen(port);
console.log(`Web server listening at http://localhost:${port}`);

try {
  // 3. Launch Playwright browser
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set OG image dimensions (1200x628)
  await page.setViewportSize({ width: 1200, height: 628 });

  // Navigate to story iframe
  const storyUrl = `http://localhost:${port}/iframe.html?id=components-opengraphimage--default&viewMode=story`;
  console.log(`Navigating to story: ${storyUrl}`);
  await page.goto(storyUrl, { waitUntil: "networkidle" });

  page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));

  // Wait for fonts to be fully loaded, and let React useLayoutEffect fit calculations execute
  console.log("Waiting for web fonts and dynamic layout fit to complete...");
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Wait for two frames to let ResizeObserver / React state updates trigger and paint
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  // Extra buffer to ensure paint completion
  await page.waitForTimeout(500);

  // Log layout dimensions for debugging
  await page.evaluate(() => {
    console.log("--- LAYOUT DEBUG ---");
    const container = document.getElementById("og-image-container");
    if (container) {
      console.log(
        `Container: ${container.clientWidth}x${container.clientHeight}`,
      );
      const card = container.children[3] || container.querySelector("div");
      if (card) {
        console.log(`Card: ${card.clientWidth}x${card.clientHeight}`);
      }
    }
    const logo = document.querySelector('[role="img"]');
    if (logo) {
      console.log(`Logo element clientWidth: ${logo.clientWidth}`);
      const lines = logo.querySelectorAll("div");
      lines.forEach((line, idx) => {
        const span = line.querySelector("span");
        if (span) {
          console.log(
            `Line ${idx} ("${span.innerText}"): line width=${line.clientWidth}, text scrollWidth=${span.scrollWidth}, fontSize=${window.getComputedStyle(span).fontSize}`,
          );
        }
      });
    }
    console.log("--------------------");
  });

  // Generate random hash
  const hash = crypto.randomBytes(4).toString("hex");
  const ogFileName = `og-image-${hash}.png`;
  const ogFilePath = path.join(publicDir, ogFileName);

  // Clean up old og-images
  console.log("Cleaning up old OpenGraph images...");
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    if (file.startsWith("og-image-") && file.endsWith(".png")) {
      fs.unlinkSync(path.join(publicDir, file));
      console.log(`Deleted: ${file}`);
    }
  }

  // Capture screenshot of the container element to avoid any outer margins or padding
  console.log(`Saving OpenGraph image to: ${ogFilePath}`);
  const element = await page.$("#og-image-container");
  if (element) {
    await element.screenshot({ path: ogFilePath, type: "png" });
  } else {
    console.warn(
      "Could not find #og-image-container element, falling back to page screenshot.",
    );
    await page.screenshot({ path: ogFilePath, type: "png" });
  }

  await browser.close();

  // 4. Update layout.tsx metadata
  console.log("Updating layout.tsx with new image hash...");
  let layoutContent = fs.readFileSync(layoutPath, "utf8");

  // Regex to match previous og-image-[hash].png or placeholder
  const ogRegex = /\/og-image-(?:placeholder|[a-f0-9]+)\.png/g;
  if (ogRegex.test(layoutContent)) {
    layoutContent = layoutContent.replace(ogRegex, `/${ogFileName}`);
    fs.writeFileSync(layoutPath, layoutContent, "utf8");
    console.log(`Successfully updated layout.tsx to point to /${ogFileName}`);
  } else {
    console.warn(
      "Could not find OpenGraph image placeholder pattern in layout.tsx!",
    );
  }
} catch (error) {
  console.error("Failed to generate OpenGraph image:", error);
} finally {
  server.close();
  console.log("Web server stopped.");
}
