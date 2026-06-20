import { AbsoluteFill } from "remotion";

/**
 * Shared placeholder for the parameterless "dummy" social templates. Renders a
 * branded background with the platform label and target dimensions centered.
 * Not a Remotion composition itself — each template wraps it with fixed values.
 */
export function DummyPlaceholder({
  label,
  width,
  height,
}: {
  label: string;
  width: number;
  height: number;
}) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b6e4f",
        color: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "sans-serif",
        gap: 8,
        padding: 24,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700 }}>Mundialito Redondela</div>
      <div style={{ fontSize: 20, fontWeight: 600, opacity: 0.9 }}>{label}</div>
      <div style={{ fontSize: 14, opacity: 0.7 }}>
        {width} × {height}
      </div>
    </AbsoluteFill>
  );
}
