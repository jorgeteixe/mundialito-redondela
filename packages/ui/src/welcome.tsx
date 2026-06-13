import type { CSSProperties } from "react";

export function Welcome() {
  return (
    <section style={styles.container} aria-labelledby="welcome-title">
      <p style={styles.eyebrow}>Mundialito Redondela</p>
      <h1 id="welcome-title" style={styles.title}>
        Welcome to Mundialito Redondela
      </h1>
      <p style={styles.copy}>A shared UI foundation for the tournament app.</p>
    </section>
  );
}

const styles = {
  container: {
    width: "min(100%, 520px)",
    display: "grid",
    gap: "16px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid color-mix(in srgb, currentColor 14%, transparent)",
    borderRadius: "8px",
    background: "color-mix(in srgb, Canvas 94%, currentColor 6%)",
    boxShadow: "0 16px 48px color-mix(in srgb, currentColor 10%, transparent)",
  },
  eyebrow: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "clamp(32px, 8vw, 56px)",
    lineHeight: 1,
    letterSpacing: "0",
  },
  copy: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>;
