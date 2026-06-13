import type { CSSProperties } from "react";
import { Logo } from "./logo";

interface OpenGraphImageProps {
  location?: string;
  subtitle?: string;
  description?: string;
  dates?: string;
}

export function OpenGraphImage({
  location = "Pista de A Xunqueira, Redondela",
  subtitle = "Torneo de Fútbol de Calle",
  description = "Sigue los resultados, estadísticas y calendario en tiempo real",
  dates = "Del 29 de junio al 24 de julio de 2026",
}: OpenGraphImageProps) {
  return (
    <div id="og-image-container" style={styles.container}>
      {/* Decorative soccer pitch layout lines */}
      <div style={styles.pitchLineLeft} />
      <div style={styles.pitchLineRight} />
      <div style={styles.pitchCenterCircle} />

      <div style={styles.card}>
        {/* Left Column: Logo */}
        <div style={styles.leftColumn}>
          <Logo style={{ width: "420px" }} />
        </div>

        {/* Vertical Divider */}
        <div style={styles.divider} />

        {/* Right Column: Information */}
        <div style={styles.rightColumn}>
          <div style={styles.badgeWrapper}>
            <span style={styles.badge}>{subtitle}</span>
          </div>

          <div style={styles.descriptionWrapper}>
            <p style={styles.description}>{description}</p>
          </div>

          <div style={styles.detailsList}>
            <div style={styles.detailItem}>
              <span style={styles.icon}>📍</span>
              <span style={styles.detailText}>{location}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.icon}>📅</span>
              <span style={styles.detailText}>{dates}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "1200px",
    height: "628px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #fdfdfd 0%, #edf2f7 100%)",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  pitchLineLeft: {
    position: "absolute",
    left: "-100px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "300px",
    height: "500px",
    border: "2px solid rgba(6, 47, 99, 0.03)",
    borderRadius: "150px",
    pointerEvents: "none",
  },
  pitchLineRight: {
    position: "absolute",
    right: "-100px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "300px",
    height: "500px",
    border: "2px solid rgba(6, 47, 99, 0.03)",
    borderRadius: "150px",
    pointerEvents: "none",
  },
  pitchCenterCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    border: "2px solid rgba(6, 47, 99, 0.02)",
    borderRadius: "300px",
    pointerEvents: "none",
  },
  card: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "1000px",
    height: "480px",
    padding: "40px",
    borderRadius: "32px",
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(6, 47, 99, 0.08)",
    boxShadow: "0 20px 50px -15px rgba(6, 47, 99, 0.08)",
    boxSizing: "border-box",
    zIndex: 10,
  },
  leftColumn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "420px",
    height: "100%",
  },
  divider: {
    width: "2px",
    height: "320px",
    background: "rgba(6, 47, 99, 0.08)",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "440px",
    height: "100%",
    padding: "10px 0 10px 20px",
    boxSizing: "border-box",
  },
  badgeWrapper: {
    display: "flex",
  },
  badge: {
    background: "#062f63",
    color: "#ffffff",
    padding: "6px 20px",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  descriptionWrapper: {
    margin: "16px 0",
  },
  description: {
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: 800,
    lineHeight: 1.3,
    margin: 0,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(6, 47, 99, 0.05)",
  },
  detailText: {
    color: "#334155",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
} satisfies Record<string, CSSProperties>;
