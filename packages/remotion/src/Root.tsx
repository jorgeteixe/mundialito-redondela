import { Composition } from "remotion";
import { PRESETS } from "./presets";
import { TEMPLATES } from "./registry";

/**
 * Maps every registry entry to a <Composition>. Side-effect free — the actual
 * registerRoot() call lives in remotion-entry.ts so consumers (backstage/worker)
 * can import the registry/components without booting the Studio root.
 */
export function RemotionRoot() {
  return (
    <>
      {TEMPLATES.map((template) => {
        const preset = PRESETS[template.preset];
        return (
          <Composition
            key={template.id}
            id={template.id}
            component={template.Component}
            durationInFrames={template.durationInFrames}
            fps={preset.fps}
            width={preset.width}
            height={preset.height}
            schema={template.schema}
            defaultProps={template.defaultProps}
          />
        );
      })}
    </>
  );
}
