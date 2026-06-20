import { loadFont } from "@remotion/google-fonts/Inter";

/**
 * Inter — the same family the app uses (@fontsource-variable/inter in the UI theme).
 * loadFont() registers it with Remotion's delayRender, so the renderer waits for the
 * font before capturing frames.
 *
 * Load only the weights/subset the compositions actually use, instead of the full
 * family. This keeps each render to a handful of font requests (no "Made N network
 * requests to load fonts" warning) and avoids fetching unused weights.
 */
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
