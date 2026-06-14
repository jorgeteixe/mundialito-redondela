import { loadFont } from "@remotion/google-fonts/Inter";

/**
 * Inter — the same family the app uses (@fontsource-variable/inter in the UI theme).
 * loadFont() registers it with Remotion's delayRender, so the renderer waits for the
 * font before capturing frames.
 */
export const { fontFamily } = loadFont();
