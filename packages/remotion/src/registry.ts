import type { ComponentType } from "react";
import type { z } from "zod";
import { HelloWorld } from "./compositions/hello-world/Component";
import { Countdown } from "./compositions/countdown/Component";
import { ResultCard } from "./compositions/result-card/Component";
import { InstagramProfile } from "./compositions/dummy/InstagramProfile";
import { FacebookProfile } from "./compositions/dummy/FacebookProfile";
import { FacebookCover } from "./compositions/dummy/FacebookCover";
import { OgShare } from "./compositions/og-share/Component";
import { TEMPLATE_DEFINITIONS } from "./templates";
import type { PresetName } from "./presets";

/**
 * A single template definition — the unit both Remotion Studio and (later) the
 * backstage <Player> + worker iterate over. Add one entry here and the template
 * shows up everywhere; no per-template wiring in three places.
 */
export type Template = {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  /** Defaults to the preset's durationInFrames when omitted. */
  durationInFrames: number;
  schema: z.ZodObject;
  Component: ComponentType<Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
};

/**
 * Ties `schema`, `Component` props, and `defaultProps` together at the call site
 * so a mismatch is a type error. Returns a widened `Template` for the array.
 */
function defineTemplate<S extends z.ZodObject>(t: {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  durationInFrames: number;
  schema: S;
  Component: ComponentType<z.infer<S>>;
  defaultProps: z.infer<S>;
}): Template {
  return t as unknown as Template;
}

function getTemplateDefinition(id: string) {
  const template = TEMPLATE_DEFINITIONS.find(
    (candidate) => candidate.id === id,
  );
  if (!template) {
    throw new Error(`Missing template definition: ${id}`);
  }

  return template;
}

export const TEMPLATES: Template[] = [
  defineTemplate({
    ...getTemplateDefinition("hello-world"),
    Component: HelloWorld as unknown as ComponentType<Record<string, unknown>>,
  }),
  defineTemplate({
    ...getTemplateDefinition("countdown"),
    Component: Countdown as unknown as ComponentType<Record<string, unknown>>,
  }),
  defineTemplate({
    ...getTemplateDefinition("result-card"),
    Component: ResultCard as unknown as ComponentType<Record<string, unknown>>,
  }),
  defineTemplate({
    ...getTemplateDefinition("instagram-profile"),
    Component: InstagramProfile as unknown as ComponentType<
      Record<string, unknown>
    >,
  }),
  defineTemplate({
    ...getTemplateDefinition("facebook-profile"),
    Component: FacebookProfile as unknown as ComponentType<
      Record<string, unknown>
    >,
  }),
  defineTemplate({
    ...getTemplateDefinition("facebook-cover"),
    Component: FacebookCover as unknown as ComponentType<
      Record<string, unknown>
    >,
  }),
  defineTemplate({
    ...getTemplateDefinition("og-share"),
    Component: OgShare as unknown as ComponentType<Record<string, unknown>>,
  }),
  // Keep this list aligned with TEMPLATE_DEFINITIONS in templates.ts.
];
