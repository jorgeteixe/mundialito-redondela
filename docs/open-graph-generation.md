# Open Graph Image Generation 🖼️

The platform dynamically generates its Open Graph meta tags preview image from the `OpenGraphImage` component story using Playwright. This ensures the preview always displays the correct location, dates, and typography matching the event details.

---

## How It Works

The generator script located at [generate-og-image.mjs](file:///Users/teixe/dev/mundialito-redondela/packages/ui/scripts/generate-og-image.mjs) automates the following steps:

1.  **Storybook Build**: Compiles Storybook static assets into `packages/ui/storybook-static/` by running `pnpm build-storybook`.
2.  **Start Static Server**: Spins up a temporary Node.js HTTP server hosting the static assets on a free port (`9999`).
3.  **Launch Headless Browser**: Launches a Playwright headless Chromium instance and navigates directly to the raw story iframe:
    ```
    http://localhost:9999/iframe.html?id=components-opengraphimage--default&viewMode=story
    ```
4.  **Fonts & Layout Sync**: Evaluates the page context and blocks until `document.fonts.ready` resolves and two layout animation frames commit. This ensures fonts load and React's dynamic identical-width text container fits have executed and painted.
5.  **Targeted Screenshot**: Screenshots only the specific element container (`#og-image-container`) at exact `1200x628` dimensions to avoid browser margins, padding, or scrollbar artifacts.
6.  **Cleanup**: Deletes any older generated images matching `og-image-[hash].png` in `apps/web/public/`.
7.  **Saves Asset**: Saves the new screenshot with a random 4-byte hash (e.g., `og-image-dc1e1914.png`) to `apps/web/public/`.
8.  **Update Layout**: Rewrites the Next.js `layout.tsx` metadata config to point to the new image file hash.
9.  **Stops Server**: Shuts down the temporary HTTP server.

---

## Usage

To generate the Open Graph image, run the following command in the workspace root:

```bash
pnpm generate:og
```

The script will build, screenshot, cleanup, and update metadata automatically.
