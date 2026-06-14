import { describe, expect, it } from "vitest";
import { PRESETS } from "./presets";
import { TEMPLATES } from "./registry";

describe("TEMPLATES registry", () => {
  it("has at least one template", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const template of TEMPLATES) {
    describe(`template "${template.id}"`, () => {
      it("uses a known kind", () => {
        expect(["video", "image"]).toContain(template.kind);
      });

      it("references an existing preset", () => {
        expect(PRESETS[template.preset]).toBeDefined();
      });

      it("has a positive duration", () => {
        expect(template.durationInFrames).toBeGreaterThan(0);
      });

      it("has defaultProps that satisfy its schema", () => {
        const result = template.schema.safeParse(template.defaultProps);
        expect(result.success).toBe(true);
      });
    });
  }
});
