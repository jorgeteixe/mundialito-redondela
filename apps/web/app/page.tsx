import { Button, Logo } from "@mr/ui";
import { CalendarDays, Megaphone } from "lucide-react";

import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>
        Mundialito da Xunqueira - Redondela 2026
      </h1>
      <div className={styles.content}>
        <Logo style={{ width: "100%", maxWidth: "340px" }} />
        <nav className={styles.links} aria-label="Enlaces principales">
          <a
            id="link-anuncio"
            className={styles.link}
            href="https://redondela.gal/evento/mundialito-da-xunquiera-2026/"
            rel="noreferrer"
            target="_blank"
          >
            <Button id="btn-anuncio" icon={Megaphone} style={{ width: "100%" }}>
              Anuncio Oficial
            </Button>
          </a>
          <a
            id="link-inscripciones"
            className={styles.link}
            href="https://docs.google.com/forms/d/e/1FAIpQLSfw9x_7AGtd7LbWosYPkU06ks8I0kLr-RGnDZETmbMTKuypVg/viewform?usp=sf_link"
            rel="noreferrer"
            target="_blank"
          >
            <Button
              id="btn-inscripciones"
              icon={CalendarDays}
              variant="secondary"
              style={{ width: "100%" }}
            >
              Inscripciones
            </Button>
          </a>
        </nav>
      </div>
    </main>
  );
}
